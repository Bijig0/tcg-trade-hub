import { useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { feedKeys, fetchListingDetail } from '@/features/feed';
import type { MyListingWithOffers } from '../../schemas';

const MAX_PREFETCH = 5;

/**
 * Prefetches listing detail data for the top active listings so that
 * navigating to MyListingDetailScreen feels instant.
 *
 * Filters for `status === 'active'`, takes the first 5, and calls
 * `queryClient.prefetchQuery` for each using the feed detail query key.
 */
const usePrefetchActiveListingDetails = (listings: MyListingWithOffers[] | undefined) => {
  const queryClient = useQueryClient();

  const activeIds = useMemo(() => {
    if (!listings) return [];
    return listings
      .filter((l) => l.status === 'active')
      .slice(0, MAX_PREFETCH)
      .map((l) => l.id);
  }, [listings]);

  const cacheKey = activeIds.join(',');

  useEffect(() => {
    if (activeIds.length === 0) return;

    for (const id of activeIds) {
      queryClient.prefetchQuery({
        queryKey: feedKeys.detail(id),
        queryFn: () => fetchListingDetail(id),
      });
    }
  }, [cacheKey, queryClient]); // eslint-disable-line react-hooks/exhaustive-deps
};

export default usePrefetchActiveListingDetails;
