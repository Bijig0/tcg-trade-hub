import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { listingKeys } from '../../queryKeys';
import type { ListingRow } from '@tcg-trade-hub/database';

/**
 * Hook that fetches the current user's listings ordered by created_at desc.
 *
 * Only returns listings with an 'active' status. Uses the authenticated
 * user's ID from Supabase auth to filter results.
 */
const useMyListings = () => {
  return useQuery<ListingRow[], Error>({
    queryKey: listingKeys.myListings(),
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['active', 'matched'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data as ListingRow[];
    },
  });
};

export default useMyListings;
