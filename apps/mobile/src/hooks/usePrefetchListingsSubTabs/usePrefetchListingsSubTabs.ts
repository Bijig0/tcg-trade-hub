import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthProvider';
import { listingKeys } from '@/features/listings/queryKeys';
import { feedKeys } from '@/features/feed/queryKeys';
import { collectionKeys } from '@/features/collection/queryKeys';
import { fetchMyListings } from '@/features/listings/hooks/useMyListings/useMyListings';
import { fetchLikedListings } from '@/features/feed/hooks/useLikedListings/useLikedListings';
import { fetchMyCollection } from '@/features/collection/hooks/useMyCollection/useMyCollection';
import { fetchMySealedProducts } from '@/features/collection/hooks/useMySealedProducts/useMySealedProducts';

/**
 * Prefetches data for all Listings sub-tabs (My Listings, Interested, Collection)
 * so they render instantly on tab switch. Called once from ListingsRoute on mount.
 *
 * Uses the same extracted queryFn functions as the hooks, guaranteeing cache shape consistency.
 * All prefetches fire concurrently and are no-ops if data is already fresh.
 */
const usePrefetchListingsSubTabs = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    queryClient.prefetchQuery({
      queryKey: listingKeys.myListings(),
      queryFn: () => fetchMyListings(user.id),
    });
    queryClient.prefetchQuery({
      queryKey: feedKeys.liked(),
      queryFn: () => fetchLikedListings(user.id),
    });
    queryClient.prefetchQuery({
      queryKey: collectionKeys.myCollection(),
      queryFn: () => fetchMyCollection(user.id),
    });
    queryClient.prefetchQuery({
      queryKey: collectionKeys.mySealedProducts(),
      queryFn: () => fetchMySealedProducts(user.id),
    });
  }, [user, queryClient]);
};

export default usePrefetchListingsSubTabs;
