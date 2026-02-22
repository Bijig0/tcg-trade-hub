import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { listingKeys } from '../../queryKeys';
import type { SelectedCard } from '../../schemas';
import type { OfferRow, OfferItemInsert } from '@tcg-trade-hub/database';

type CreateOfferInput = {
  listingId: string;
  selectedCards: SelectedCard[];
  cashAmount: number;
  message: string | null;
};

/**
 * Mutation hook that creates an offer on a listing.
 * Inserts an offer row followed by offer_items rows for each selected card.
 */
const useCreateOffer = () => {
  const queryClient = useQueryClient();

  return useMutation<OfferRow, Error, CreateOfferInput>({
    mutationFn: async ({ listingId, selectedCards, cashAmount, message }) => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user ?? null;

      if (!user) throw new Error('User not authenticated');

      // Insert offer
      const { data: offer, error: offerError } = await supabase
        .from('offers')
        .insert({
          listing_id: listingId,
          offerer_id: user.id,
          cash_amount: cashAmount,
          message,
        })
        .select()
        .single();

      if (offerError) throw offerError;

      // Insert offer items
      if (selectedCards.length > 0) {
        const items: OfferItemInsert[] = selectedCards.map((sc) => ({
          offer_id: offer.id,
          card_name: sc.card.name,
          card_image_url: sc.card.imageUrl,
          card_external_id: sc.card.externalId,
          tcg: sc.card.tcg,
          card_set: sc.card.setName,
          card_number: sc.card.number,
          condition: sc.condition,
          market_price: sc.card.marketPrice ?? null,
          quantity: 1,
        }));

        const { error: itemsError } = await supabase
          .from('offer_items')
          .insert(items);

        if (itemsError) throw itemsError;
      }

      return offer as OfferRow;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: listingKeys.offers(variables.listingId) });
      queryClient.invalidateQueries({ queryKey: listingKeys.detail(variables.listingId) });
    },
  });
};

export default useCreateOffer;
