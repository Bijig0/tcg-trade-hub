import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { feedKeys } from '../../queryKeys';
import type { ListingWithDistance } from '../../schemas';
import type { ListingItemRow } from '@tcg-trade-hub/database';

/**
 * Fetches a single listing by ID with its items, owner information, and pending offer count.
 *
 * Joins the `users` table to include owner display_name, avatar_url,
 * rating_score, and total_trades alongside all listing fields.
 * Also fetches listing_items and counts pending offers.
 */
export const fetchListingDetail = async (listingId: string): Promise<ListingWithDistance> => {
  // Fetch listing with owner
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

  // Fetch listing items
  const { data: items, error: itemsError } = await supabase
    .from('listing_items')
    .select('*')
    .eq('listing_id', listingId)
    .order('created_at', { ascending: true });

  if (itemsError) throw itemsError;

  // Count pending offers
  const { count, error: countError } = await supabase
    .from('offers')
    .select('id', { count: 'exact', head: true })
    .eq('listing_id', listingId)
    .eq('status', 'pending');

  if (countError) throw countError;

  // Supabase returns the joined user as an object under the alias `owner`
  const listing = data as unknown as ListingWithDistance;

  // distance_km is not available from a direct query; default to 0
  // The feed edge function normally provides this value
  if (listing.distance_km === undefined) {
    (listing as Record<string, unknown>).distance_km = 0;
  }

  (listing as Record<string, unknown>).items = (items ?? []) as ListingItemRow[];
  (listing as Record<string, unknown>).offer_count = count ?? 0;

  return listing;
};

/**
 * Hook that fetches a single listing by ID with its items and owner information.
 */
const useListingDetail = (listingId: string) => {
  return useQuery<ListingWithDistance, Error>({
    queryKey: feedKeys.detail(listingId),
    queryFn: () => fetchListingDetail(listingId),
    enabled: !!listingId,
  });
};

export default useListingDetail;
