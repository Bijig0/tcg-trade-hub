import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { listingKeys } from '../../queryKeys';
import type { SelectedCard } from '../../schemas';

type CreateOfferInput = {
  listingId: string;
  selectedCards: SelectedCard[];
  cashAmount: number;
  message: string | null;
};

type CreateOfferResult = {
  offer_id: string;
};

/**
 * Mutation hook that creates an offer on a listing via atomic Postgres RPC.
 *
 * Atomically inserts an offer row and all offer_items in a single transaction.
 *
 * @see packages/api/src/pipelines/createOffer/createOffer.ts
 */
const useCreateOffer = () => {
  const queryClient = useQueryClient();

  return useMutation<CreateOfferResult, Error, CreateOfferInput>({
    mutationFn: async ({ listingId, selectedCards, cashAmount, message }) => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user ?? null;

      if (!user) throw new Error('User not authenticated');

      const items = selectedCards.map((sc) => ({
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

      const { data, error } = await supabase.rpc('create_offer_v1' as never, {
        p_listing_id: listingId,
        p_offerer_id: user.id,
        p_cash_amount: cashAmount,
        p_message: message,
        p_items: JSON.stringify(items),
      } as never);

      if (error) throw error;

      return data as CreateOfferResult;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: listingKeys.offers(variables.listingId) });
      queryClient.invalidateQueries({ queryKey: listingKeys.detail(variables.listingId) });
    },
  });
};

export default useCreateOffer;
