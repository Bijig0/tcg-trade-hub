import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { listingKeys } from '../../queryKeys';
import { devEmitter, createTraceId } from '@/services/devLiveEmitter/devLiveEmitter';

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
 * Mutation that accepts or declines an offer via atomic Postgres RPC.
 *
 * On accept: atomically accepts the offer, declines all sibling offers,
 * creates a match + conversation, and transitions the listing to matched.
 * Then navigates to the new chat.
 *
 * On decline: atomically declines the single offer.
 *
 * @see packages/api/src/pipelines/acceptOffer/acceptOffer.ts
 * @see packages/api/src/pipelines/declineOffer/declineOffer.ts
 */
const useRespondToOffer = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<RespondResult, Error, RespondInput>({
    mutationFn: async ({ offerId, listingId, action }) => {
      const pipelineId = action === 'accepted' ? 'pipeline:acceptOffer' : 'pipeline:declineOffer';
      const scoped = __DEV__
        ? devEmitter.forPath(pipelineId, createTraceId(), `mobile:${action}Offer`)
        : undefined;

      scoped?.(0, 'started');

      const {
        data: { session },
      } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      if (!userId) throw new Error('Not authenticated');

      try {
        if (action === 'accepted') {
          const { data, error } = await supabase.rpc('accept_offer_v1', {
            p_offer_id: offerId,
            p_listing_id: listingId,
            p_user_id: userId,
          });

          if (error) throw error;

          const result = data as { match_id: string; conversation_id: string };
          scoped?.(0, 'success');
          return {
            match_id: result.match_id,
            conversation_id: result.conversation_id,
          };
        }

        // Decline
        const { error } = await supabase.rpc('decline_offer_v1', {
          p_offer_id: offerId,
          p_user_id: userId,
        });

        if (error) throw error;

        scoped?.(0, 'success');
        return { match_id: null, conversation_id: null };
      } catch (err) {
        scoped?.(0, 'error', { message: (err as Error).message });
        throw err;
      }
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
