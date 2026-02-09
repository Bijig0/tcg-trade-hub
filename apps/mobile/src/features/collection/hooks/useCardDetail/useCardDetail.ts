import { useQuery } from '@tanstack/react-query';
import { cardDataService } from '@/services/cardData';
import type { CardDetail } from '@/services/cardData';
import { collectionKeys } from '../../queryKeys';

/**
 * Fetches full card detail + prices from the card data service adapter.
 * Enabled only when externalId is provided.
 */
const useCardDetail = (externalId: string | null) => {
  return useQuery<CardDetail | null, Error>({
    queryKey: collectionKeys.cardDetail(externalId ?? ''),
    queryFn: () => cardDataService.getCardDetail(externalId!),
    enabled: !!externalId,
    staleTime: 1000 * 60 * 15, // 15 min cache
  });
};

export default useCardDetail;
