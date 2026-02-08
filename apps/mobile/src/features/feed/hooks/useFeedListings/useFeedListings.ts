import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useFeedStore } from '@/stores/feedStore/feedStore';
import { feedKeys } from '../../queryKeys';
import type { ListingWithDistance } from '../../schemas';

const PAGE_SIZE = 20;

type FeedPage = {
  listings: ListingWithDistance[];
  nextCursor: number | null;
};

/**
 * Hook that fetches the feed listings using an infinite query.
 *
 * Calls the `get-feed` edge function with the current filter state from
 * useFeedStore. Returns paginated results with `fetchNextPage` support.
 */
const useFeedListings = () => {
  const filters = useFeedStore((s) => s.filters);

  return useInfiniteQuery<FeedPage, Error>({
    queryKey: feedKeys.list(filters),
    queryFn: async ({ pageParam }) => {
      const { data, error } = await supabase.functions.invoke<FeedPage>('get-feed', {
        body: {
          tcg: filters.tcg,
          listing_type: filters.listingType,
          condition: filters.condition,
          sort: filters.sort,
          cursor: pageParam,
          limit: PAGE_SIZE,
        },
      });

      if (error) throw error;
      if (!data) throw new Error('No data returned from get-feed');

      return data;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
};

export default useFeedListings;
