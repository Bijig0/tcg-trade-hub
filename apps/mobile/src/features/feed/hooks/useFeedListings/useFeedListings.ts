import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthProvider';
import { useFeedStore } from '@/stores/feedStore/feedStore';
import { feedKeys } from '../../queryKeys';
import { buildExclusionSets } from '../../algorithm';
import { transformRawListing } from '../../algorithm';
import { sortListings } from '../../algorithm';
import type { RawFeedListing } from '../../algorithm';
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
 * joins listing_items and user profiles. Delegates exclusion set building,
 * data transformation, and sorting to pure functions in `algorithm/`.
 */
const useFeedListings = () => {
  const { user } = useAuth();
  const filters = useFeedStore((s) => s.filters);

  return useInfiniteQuery<FeedPage, Error>({
    queryKey: feedKeys.list(filters),
    queryFn: async ({ pageParam }) => {
      if (!user) throw new Error('Not authenticated');

      // 1. Fetch exclusion data in parallel
      const [{ data: swipes }, { data: blocks }] = await Promise.all([
        supabase
          .from('swipes')
          .select('listing_id')
          .eq('user_id', user.id),
        supabase
          .from('blocks')
          .select('blocker_id, blocked_id')
          .or(`blocker_id.eq.${user.id},blocked_id.eq.${user.id}`),
      ]);

      const { swipedIds, blockedUserIds } = buildExclusionSets(swipes, blocks, user.id);

      // 2. Build the listings query
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

      if (swipedIds.length > 0) {
        query = query.not('id', 'in', `(${swipedIds.join(',')})`);
      }
      if (blockedUserIds.length > 0) {
        query = query.not('user_id', 'in', `(${blockedUserIds.join(',')})`);
      }

      if (filters.tcg) {
        query = query.eq('tcg', filters.tcg);
      }
      if (filters.listingTypes.length > 0) {
        query = query.in('type', filters.listingTypes);
      }

      if (pageParam) {
        query = query.lt('created_at', pageParam as string);
      }

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

      console.log(`[useFeedListings] user=${user.id}, swipedIds=${swipedIds.length}, blockedUserIds=${blockedUserIds.length}, fetched=${rawListings.length}`);

      // 3. Transform and sort
      const listings = (rawListings as unknown as RawFeedListing[]).map(transformRawListing);
      const sorted = sortListings(listings, filters.sort);

      // 4. Determine next cursor
      const lastListing = sorted[sorted.length - 1];
      const nextCursor =
        sorted.length === PAGE_SIZE && lastListing
          ? lastListing.created_at
          : null;

      return { listings: sorted, nextCursor };
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: !!user,
  });
};

export default useFeedListings;
