import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { feedKeys } from '../../queryKeys';
import type { ListingWithDistance } from '../../schemas';

/**
 * Hook that fetches a single listing by ID with its owner information.
 *
 * Joins the `users` table to include owner display_name, avatar_url,
 * rating_score, and total_trades alongside all listing fields.
 */
const useListingDetail = (listingId: string) => {
  return useQuery<ListingWithDistance, Error>({
    queryKey: feedKeys.detail(listingId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('listings')
        .select(
          `
          *,
          owner:users!user_id (
            display_name,
            avatar_url,
            rating_score,
            total_trades
          )
        `,
        )
        .eq('id', listingId)
        .single();

      if (error) throw error;

      // Supabase returns the joined user as an object under the alias `owner`
      const listing = data as unknown as ListingWithDistance;

      // distance_km is not available from a direct query; default to 0
      // The feed edge function normally provides this value
      if (listing.distance_km === undefined) {
        (listing as Record<string, unknown>).distance_km = 0;
      }

      return listing;
    },
    enabled: !!listingId,
  });
};

export default useListingDetail;
