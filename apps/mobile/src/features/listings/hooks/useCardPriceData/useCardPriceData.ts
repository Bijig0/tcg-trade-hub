import { useQueries } from '@tanstack/react-query';
import { cardDataService } from '@/services/cardData/cardDataService';
import type { CardDetail } from '@/services/cardData/types';

/**
 * Batch-fetches CardDetail (with price data) for multiple cards.
 *
 * Uses TanStack Query's `useQueries` to fire parallel queries for each
 * externalId. Returns a map of externalId -> CardDetail for easy lookup.
 */
const useCardPriceData = (externalIds: string[]) => {
  const results = useQueries({
    queries: externalIds.map((id) => ({
      queryKey: ['card-detail', id] as const,
      queryFn: () => cardDataService.getCardDetail(id),
      staleTime: 1000 * 60 * 30, // 30 min cache
      enabled: id.length > 0,
    })),
  });

  const priceMap = new Map<string, CardDetail>();
  const isLoading = results.some((r) => r.isLoading);

  for (let i = 0; i < externalIds.length; i++) {
    const id = externalIds[i];
    const data = results[i]?.data;
    if (data && id) {
      priceMap.set(id, data);
    }
  }

  return { priceMap, isLoading };
};

export default useCardPriceData;
