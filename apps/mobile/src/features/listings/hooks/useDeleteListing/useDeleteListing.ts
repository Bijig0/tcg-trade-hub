import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { listingKeys } from '../../queryKeys';
import { feedKeys } from '../../../feed/queryKeys';

type ExpireResult = {
  success: boolean;
  withdrawn_offer_count: number;
};

/**
 * Hook that expires a listing via atomic Postgres RPC.
 *
 * Atomically transitions the listing to 'expired' and withdraws
 * all pending offers. Invalidates myListings and feed queries on success.
 *
 * @see packages/api/src/pipelines/expireListing/expireListing.ts
 */
const useDeleteListing = () => {
  const queryClient = useQueryClient();

  return useMutation<ExpireResult, Error, string>({
    mutationFn: async (listingId) => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      if (!userId) throw new Error('Not authenticated');

      const { data, error } = await supabase.rpc('expire_listing_v1' as never, {
        p_listing_id: listingId,
        p_user_id: userId,
      } as never);

      if (error) throw error;

      return data as ExpireResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: listingKeys.myListings() });
      queryClient.invalidateQueries({ queryKey: feedKeys.lists() });
    },
  });
};

export default useDeleteListing;
