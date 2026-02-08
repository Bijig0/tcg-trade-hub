import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { listingKeys } from '../../queryKeys';
import { feedKeys } from '../../../feed/queryKeys';

/**
 * Hook that soft-deletes a listing by updating its status to 'expired'.
 *
 * Invalidates myListings and feed queries on success.
 */
const useDeleteListing = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (listingId) => {
      const { error } = await supabase
        .from('listings')
        .update({ status: 'expired' })
        .eq('id', listingId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: listingKeys.myListings() });
      queryClient.invalidateQueries({ queryKey: feedKeys.lists() });
    },
  });
};

export default useDeleteListing;
