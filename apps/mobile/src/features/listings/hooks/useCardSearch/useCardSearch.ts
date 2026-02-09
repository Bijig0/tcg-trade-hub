import { useQuery } from '@tanstack/react-query';
import type { TcgType, NormalizedCard } from '@tcg-trade-hub/database';
import { cardDataService } from '@/services/cardData';

type UseCardSearchOptions = {
  tcg: TcgType | null;
  query: string;
};

/**
 * Hook that searches for cards via the card data service adapter.
 *
 * Only fires when query is 2+ characters long. Returns NormalizedCard[].
 * Intended to be used with a debounced input value.
 */
const useCardSearch = ({ tcg, query }: UseCardSearchOptions) => {
  const enabled = !!tcg && query.length >= 2;

  return useQuery<NormalizedCard[], Error>({
    queryKey: ['card-search', tcg, query],
    queryFn: () => cardDataService.searchCards(query, tcg!),
    enabled,
    staleTime: 1000 * 60 * 10,
  });
};

export default useCardSearch;
