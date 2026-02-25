import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthProvider';
import { useFeedStore } from '@/stores/feedStore/feedStore';
import { feedKeys } from '../../queryKeys';
import type { ListingWithDistance } from '../../schemas';

const PAGE_SIZE = 20;

type FeedPage = {
  listings: ListingWithDistance[];
  nextCursor: string | null;
};

/**
 * Hook that fetches the feed listings using an infinite query.
 *
 * Queries Supabase directly — fetches active listings from other users,
 * joins listing_items and user profiles, excludes already-swiped listings
 * and blocked users.
 */
const useFeedListings = () => {
  const { user } = useAuth();
  const filters = useFeedStore((s) => s.filters);

  return useInfiniteQuery<FeedPage, Error>({
    queryKey: feedKeys.list(filters),
    queryFn: async ({ pageParam }) => {
      if (!user) throw new Error('Not authenticated');

      // 1. Fetch swiped listing IDs to exclude
      const { data: swipes } = await supabase
        .from('swipes')
        .select('listing_id')
        .eq('user_id', user.id);

      const swipedIds = (swipes ?? []).map((s) => s.listing_id);

      // 2. Fetch blocked user IDs (both directions)
      const { data: blocks } = await supabase
        .from('blocks')
        .select('blocker_id, blocked_id')
        .or(`blocker_id.eq.${user.id},blocked_id.eq.${user.id}`);

      const blockedUserIds: string[] = [];
      for (const block of blocks ?? []) {
        if (block.blocker_id === user.id) blockedUserIds.push(block.blocked_id);
        else blockedUserIds.push(block.blocker_id);
      }

      // 3. Build the listings query
      let query = supabase
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
        .eq('status', 'active')
        .neq('user_id', user.id);

      // Exclude swiped listings
      if (swipedIds.length > 0) {
        query = query.not('id', 'in', `(${swipedIds.join(',')})`);
      }

      // Exclude blocked users
      if (blockedUserIds.length > 0) {
        query = query.not('user_id', 'in', `(${blockedUserIds.join(',')})`);
      }

      // Apply filters
      if (filters.tcg) {
        query = query.eq('tcg', filters.tcg);
      }
      if (filters.listingTypes.length > 0) {
        query = query.in('type', filters.listingTypes);
      }

      // Cursor-based pagination
      if (pageParam) {
        query = query.lt('created_at', pageParam as string);
      }

      // Order and limit
      query = query.order('created_at', { ascending: false }).limit(PAGE_SIZE);

      const { data: rawListings, error } = await query;

      if (error) {
        console.error('[useFeedListings] Supabase query error:', error);
        throw error;
      }

      if (!rawListings) {
        console.warn('[useFeedListings] No data returned from query');
        return { listings: [], nextCursor: null };
      }

      console.log(`[useFeedListings] Fetched ${rawListings.length} listings`);

      // 4. Transform to ListingWithDistance shape
      const listings: ListingWithDistance[] = rawListings.map((listing) => {
        const userProfile = listing.users as unknown as {
          id: string;
          display_name: string;
          avatar_url: string | null;
          location: unknown;
          rating_score: number;
          total_trades: number;
        };

        const items = (listing.listing_items ?? []) as unknown as ListingWithDistance['items'];

        return {
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
          distance_km: 0, // TODO: compute from PostGIS when location available
          owner: {
            display_name: userProfile.display_name,
            avatar_url: userProfile.avatar_url,
            rating_score: userProfile.rating_score ?? 0,
            total_trades: userProfile.total_trades ?? 0,
          },
          items,
          offer_count: 0,
        };
      });

      // Determine next cursor
      const lastListing = listings[listings.length - 1];
      const nextCursor =
        listings.length === PAGE_SIZE && lastListing
          ? lastListing.created_at
          : null;

      return { listings, nextCursor };
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: !!user,
  });
};

export default useFeedListings;
