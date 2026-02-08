import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { TcgType, NormalizedCard } from '@tcg-trade-hub/database';

type UseCardSearchOptions = {
  tcg: TcgType | null;
  query: string;
};

/**
 * Hook that searches for cards using the `card-search` edge function.
 *
 * Only fires when query is 2+ characters long. Returns NormalizedCard[].
 * Intended to be used with a debounced input value.
 */
const useCardSearch = ({ tcg, query }: UseCardSearchOptions) => {
  const enabled = !!tcg && query.length >= 2;

  return useQuery<NormalizedCard[], Error>({
    queryKey: ['card-search', tcg, query],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke<{ cards: NormalizedCard[] }>(
        'card-search',
        {
          body: { tcg, query },
        },
      );

      if (error) throw error;
      if (!data) return [];

      return data.cards;
    },
    enabled,
    staleTime: 1000 * 60 * 10, // Cache card searches for 10 minutes
  });
};

export default useCardSearch;
