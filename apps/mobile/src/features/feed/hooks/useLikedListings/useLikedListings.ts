import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthProvider';
import { feedKeys } from '../../queryKeys';
import type { ListingWithDistance } from '../../schemas';

/**
 * Fetches listings a user has swiped "like" on.
 * Extracted as a standalone function so both the hook and prefetch use the same queryFn.
 */
export const fetchLikedListings = async (userId: string) => {
  // 1. Get liked listing IDs
  const { data: swipes, error: swipeError } = await supabase
    .from('swipes')
    .select('listing_id, created_at')
    .eq('user_id', userId)
    .eq('direction', 'like')
    .order('created_at', { ascending: false });

  if (swipeError) throw swipeError;
  if (!swipes || swipes.length === 0) return [];

  const likedIds = swipes.map((s) => s.listing_id);

  // 2. Fetch the actual listings
  const { data: rawListings, error: listingError } = await supabase
    .from('listings')
    .select(`
      *,
      listing_items (*),
      users!inner (
        id,
        display_name,
        avatar_url,
        location,
        rating_score,
        total_trades
      )
    `)
    .in('id', likedIds)
    .eq('status', 'active');

  if (listingError) throw listingError;
  if (!rawListings) return [];

  // 3. Transform to ListingWithDistance and preserve swipe order
  const listingMap = new Map<string, ListingWithDistance>();

  for (const listing of rawListings) {
    const userProfile = listing.users as unknown as {
      id: string;
      display_name: string;
      avatar_url: string | null;
      location: unknown;
      rating_score: number;
      total_trades: number;
    };

    const items = (listing.listing_items ?? []) as unknown as ListingWithDistance['items'];

    listingMap.set(listing.id, {
      id: listing.id,
      user_id: listing.user_id,
      type: listing.type,
      tcg: listing.tcg,
      title: listing.title,
      cash_amount: listing.cash_amount,
      total_value: listing.total_value,
      description: listing.description,
      photos: listing.photos,
      status: listing.status,
      created_at: listing.created_at,
      updated_at: listing.updated_at,
      distance_km: 0,
      owner: {
        display_name: userProfile.display_name,
        avatar_url: userProfile.avatar_url,
        rating_score: userProfile.rating_score ?? 0,
        total_trades: userProfile.total_trades ?? 0,
      },
      items,
      offer_count: 0,
    });
  }

  // Return in swipe order (most recent first), filtering out inactive/deleted
  return likedIds
    .map((id) => listingMap.get(id))
    .filter((l): l is ListingWithDistance => l !== undefined);
};

/**
 * Fetches listings the current user has swiped "like" on.
 *
 * Queries the swipes table for likes, then fetches the corresponding active
 * listings with items and owner profiles. Returns most-recently-liked first.
 */
const useLikedListings = () => {
  const { user } = useAuth();

  return useQuery<ListingWithDistance[], Error>({
    queryKey: feedKeys.liked(),
    queryFn: () => fetchLikedListings(user!.id),
    enabled: !!user,
  });
};

export default useLikedListings;
