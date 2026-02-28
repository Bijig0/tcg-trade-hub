import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { listingKeys } from '../../queryKeys';
import { feedKeys } from '../../../feed/queryKeys';
import { collectionKeys } from '../../../collection/queryKeys';
import generateBundleTitle from '../../utils/generateBundleTitle/generateBundleTitle';
import type { SelectedCard } from '../../schemas';
import type { ListingRow, ListingType, ListingItemInsert, TradeWant } from '@tcg-trade-hub/database';
import { devEmitter, createTraceId } from '@/services/devLiveEmitter/devLiveEmitter';

type BundleListingInput = {
  type: ListingType;
  selectedCards: SelectedCard[];
  cashAmount: number;
  description: string | null;
  tradeWants?: TradeWant[];
  acceptsCash: boolean;
  acceptsTrades: boolean;
};

/**
 * Creates a single bundle listing with N listing_items rows.
 * Computes title and total_value from the selected cards.
 * Includes accepts_cash/accepts_trades for the Have/Want system.
 * Auto-adds external search cards to collection (non-blocking).
 */
const useCreateBundleListing = () => {
  const queryClient = useQueryClient();

  return useMutation<ListingRow, Error, BundleListingInput>({
    mutationFn: async ({ type, selectedCards, cashAmount, description, tradeWants, acceptsCash, acceptsTrades }) => {
      const scoped = __DEV__
        ? devEmitter.forPath('flow:p2p-trade', createTraceId(), 'mobile:createListing')
        : undefined;

      scoped?.(0, 'started');

      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user ?? null;

      if (!user) throw new Error('User not authenticated');

      const title = generateBundleTitle(selectedCards);
      const itemMarketTotal = selectedCards.reduce((sum, sc) => {
        return sum + (sc.card.marketPrice ?? 0);
      }, 0);
      const totalValue = itemMarketTotal + cashAmount;

      // Determine dominant TCG from items
      const tcg = selectedCards[0]?.card.tcg ?? 'pokemon';

      // 1. Insert listing row
      const { data: listing, error: listingError } = await supabase
        .from('listings')
        .insert({
          user_id: user.id,
          type,
          tcg,
          title,
          cash_amount: cashAmount,
          total_value: totalValue,
          description,
          photos: [],
          trade_wants: JSON.stringify(tradeWants ?? []),
          accepts_cash: acceptsCash,
          accepts_trades: acceptsTrades,
        })
        .select()
        .single();

      if (listingError) throw listingError;

      // 2. Insert listing_items rows
      const items: ListingItemInsert[] = selectedCards.map((sc) => ({
        listing_id: listing.id,
        card_name: sc.card.name,
        card_image_url: sc.card.imageUrl,
        card_external_id: sc.card.externalId,
        tcg: sc.card.tcg,
        card_set: sc.card.setName,
        card_number: sc.card.number,
        card_rarity: sc.card.rarity ?? null,
        condition: sc.condition,
        market_price: sc.card.marketPrice ?? null,
        asking_price: sc.askingPrice ? parseFloat(sc.askingPrice) : null,
        quantity: 1,
      }));

      const { error: itemsError } = await supabase
        .from('listing_items')
        .insert(items);

      if (itemsError) throw itemsError;

      // 3. Auto-add external cards to collection (non-blocking)
      const externalCards = selectedCards.filter(
        (sc) => !sc.fromCollection && sc.addToCollection,
      );

      if (externalCards.length > 0) {
        try {
          await supabase.from('collection_items').upsert(
            externalCards.map((sc) => ({
              user_id: user.id,
              tcg: sc.card.tcg,
              external_id: sc.card.externalId,
              card_name: sc.card.name,
              set_name: sc.card.setName,
              set_code: sc.card.setCode,
              card_number: sc.card.number,
              image_url: sc.card.imageUrl,
              rarity: sc.card.rarity ?? null,
              condition: sc.condition,
              quantity: 1,
              is_wishlist: false,
              is_sealed: false,
              market_price: sc.card.marketPrice ?? null,
            })),
            { onConflict: 'user_id,external_id,condition,is_wishlist' },
          );
        } catch {
          // Non-blocking
        }
      }

      scoped?.(0, 'success');
      return listing as ListingRow;
    },
    onError: (err: Error) => {
      if (__DEV__) {
        devEmitter.emit({
          pathId: 'flow:p2p-trade',
          stepIndex: 0,
          status: 'error',
          traceId: 'late-error',
          timestamp: Date.now(),
          caller: 'mobile:createListing',
          message: err.message,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: listingKeys.myListings() });
      queryClient.invalidateQueries({ queryKey: feedKeys.lists() });
      queryClient.invalidateQueries({ queryKey: collectionKeys.myCollection() });
      queryClient.invalidateQueries({ queryKey: collectionKeys.portfolioValue() });
    },
  });
};

export default useCreateBundleListing;
