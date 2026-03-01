import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthProvider';
import { useFeedStore } from '@/stores/feedStore/feedStore';
import parseLocationCoords from '@/utils/parseLocationCoords/parseLocationCoords';
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
 * Supports the Have/Want filter model:
 * - wantToBuy → filters listings where accepts_cash = true
 * - wantToTrade → filters listings where accepts_trades = true
 * - searchQuery → filters by card name via listing_items join
 */
const useFeedListings = () => {
  const { user, profile } = useAuth();
  const filters = useFeedStore((s) => s.filters);
  const userLocation = profile?.location ? parseLocationCoords(profile.location) : null;

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
      // When searching by card name, we need to filter via listing_items
      const hasSearch = filters.searchQuery.length > 0;

      let query = supabase
        .from('listings')
        .select(`
          *,
          listing_items${hasSearch ? '!inner' : ''} (*),
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

      // Card name search via listing_items
      if (hasSearch) {
        query = query.ilike('listing_items.card_name', `%${filters.searchQuery}%`);
      }

      if (swipedIds.length > 0) {
        query = query.not('id', 'in', `(${swipedIds.join(',')})`);
      }
      if (blockedUserIds.length > 0) {
        query = query.not('user_id', 'in', `(${blockedUserIds.join(',')})`);
      }

      if (filters.tcg) {
        query = query.eq('tcg', filters.tcg);
      }

      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      // Have/Want intent-based filters
      if (filters.wantToBuy && !filters.wantToTrade) {
        query = query.eq('accepts_cash', true);
      } else if (filters.wantToTrade && !filters.wantToBuy) {
        query = query.eq('accepts_trades', true);
      }
      // If both or neither are active, no filter — show all

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

      console.log(`[useFeedListings] user=${user.id}, swipedIds=${swipedIds.length}, blockedUserIds=${blockedUserIds.length}, search="${filters.searchQuery}", fetched=${rawListings.length}`);

      // 3. Transform and sort
      const listings = (rawListings as unknown as RawFeedListing[]).map(
        (raw) => transformRawListing(raw, userLocation),
      );
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
