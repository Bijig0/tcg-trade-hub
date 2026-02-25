import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { listingKeys } from '../../queryKeys';
import { assertTransition } from '@tcg-trade-hub/database';
import type { OfferStatus, ListingStatus } from '@tcg-trade-hub/database';

type RespondInput = {
  offerId: string;
  listingId: string;
  action: 'accepted' | 'declined';
};

type RespondResult = {
  match_id: string | null;
  conversation_id: string | null;
};

/**
 * Mutation that accepts or declines an offer.
 * On accept: creates match + conversation, navigates to chat.
 */
const useRespondToOffer = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<RespondResult, Error, RespondInput>({
    mutationFn: async ({ offerId, listingId, action }) => {
      // Fetch current offer to validate transition
      const { data: currentOffer, error: fetchOfferError } = await supabase
        .from('offers')
        .select('*')
        .eq('id', offerId)
        .single();

      if (fetchOfferError) throw fetchOfferError;

      assertTransition('offer', currentOffer.status as OfferStatus, action);

      // Update offer status
      const { error: offerError } = await supabase
        .from('offers')
        .update({ status: action as OfferStatus })
        .eq('id', offerId);

      if (offerError) throw offerError;

      if (action === 'accepted') {
        const offer = currentOffer;

        const {
          data: { session },
        } = await supabase.auth.getSession();
        const userId = session?.user?.id;

        if (!userId) throw new Error('Not authenticated');

        // Create match
        const { data: match, error: matchError } = await supabase
          .from('matches')
          .insert({
            user_a_id: userId,
            user_b_id: offer.offerer_id,
            listing_id: listingId,
            offer_id: offerId,
          })
          .select()
          .single();

        if (matchError) throw matchError;

        // Validate and update listing status
        const { data: currentListing, error: listingFetchError } = await supabase
          .from('listings')
          .select('status')
          .eq('id', listingId)
          .single();

        if (listingFetchError) throw listingFetchError;

        assertTransition('listing', currentListing.status as ListingStatus, 'matched');

        await supabase
          .from('listings')
          .update({ status: 'matched' })
          .eq('id', listingId);

        // Create conversation
        const { data: conversation, error: convoError } = await supabase
          .from('conversations')
          .insert({ match_id: match.id })
          .select()
          .single();

        if (convoError) throw convoError;

        return {
          match_id: match.id,
          conversation_id: conversation.id,
        };
      }

      return { match_id: null, conversation_id: null };
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: listingKeys.offers(variables.listingId) });
      queryClient.invalidateQueries({ queryKey: listingKeys.myListings() });
      queryClient.invalidateQueries({ queryKey: listingKeys.detail(variables.listingId) });

      if (data.conversation_id) {
        router.push(`/(tabs)/(messages)/chat/${data.conversation_id}`);
      }
    },
  });
};

export default useRespondToOffer;
