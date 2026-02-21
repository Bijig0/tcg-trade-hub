import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { listingKeys } from '../../queryKeys';
import { feedKeys } from '../../../feed/queryKeys';
import { collectionKeys } from '../../../collection/queryKeys';
import type { SelectedCard, WantedCard, TradeWantsPayload } from '../../schemas';
import type { ListingInsert, ListingRow } from '@tcg-trade-hub/database';

type BulkListingInput = {
  type: 'wts' | 'wtt';
  selectedCards: SelectedCard[];
  wantedCards?: WantedCard[];
};

/**
 * Creates N listings in a single insert call.
 *
 * - WTS: each selected card becomes its own listing row with asking_price
 * - WTT: each offered card becomes a listing row with trade_wants JSONB
 * - Auto-adds external search cards to collection (non-blocking)
 */
const useCreateBulkListings = () => {
  const queryClient = useQueryClient();

  return useMutation<ListingRow[], Error, BulkListingInput>({
    mutationFn: async ({ type, selectedCards, wantedCards }) => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user ?? null;

      if (!user) throw new Error('User not authenticated');

      // Build trade_wants payload for WTT
      const tradeWantsPayload: TradeWantsPayload | null =
        type === 'wtt' && wantedCards?.length
          ? wantedCards.map((wc) => ({
              externalId: wc.card.externalId,
              tcg: wc.card.tcg,
              name: wc.card.name,
              imageUrl: wc.card.imageUrl,
              marketPrice: wc.card.marketPrice,
            }))
          : null;

      // Build listing rows
      const rows: ListingInsert[] = selectedCards.map((sc) => ({
        user_id: user.id,
        type,
        tcg: sc.card.tcg,
        card_name: sc.card.name,
        card_set: sc.card.setName,
        card_number: sc.card.number,
        card_external_id: sc.card.externalId,
        card_image_url: sc.card.imageUrl,
        card_rarity: sc.card.rarity ?? null,
        card_market_price: sc.card.marketPrice ?? null,
        condition: sc.condition,
        asking_price: sc.askingPrice ? parseFloat(sc.askingPrice) : null,
        description: null,
        photos: [],
        trade_wants: tradeWantsPayload,
      }));

      const { data, error } = await supabase
        .from('listings')
        .insert(rows)
        .select();

      if (error) throw error;

      // Auto-add external cards to collection (non-blocking)
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
          // Non-blocking: collection add failure shouldn't prevent listing success
        }
      }

      return data as ListingRow[];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: listingKeys.myListings() });
      queryClient.invalidateQueries({ queryKey: feedKeys.lists() });
      queryClient.invalidateQueries({ queryKey: collectionKeys.myCollection() });
      queryClient.invalidateQueries({ queryKey: collectionKeys.portfolioValue() });
    },
  });
};

export default useCreateBulkListings;
