import { useState, useCallback, useRef, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { TcgType, NormalizedCard } from '@tcg-trade-hub/database';
import { cardDataService } from '@/services/cardData';
import { useFeedStore } from '@/stores/feedStore/feedStore';

const DEBOUNCE_MS = 300;
const MAX_PREVIEW = 5;

type UseAutocompleteSearchReturn = {
  query: string;
  setQuery: (text: string) => void;
  clearQuery: () => void;
  isDropdownOpen: boolean;
  setIsDropdownOpen: (open: boolean) => void;
  previewResults: NormalizedCard[];
  hasMore: boolean;
  isLoading: boolean;
  totalResults: number;
};

/**
 * Hook that wraps card search with debouncing and dropdown state
 * for autocomplete UX in the browse view.
 *
 * - Local `query` state with 300ms debounce before triggering search
 * - Limits preview to 5 results with a "See all" affordance
 * - Respects the current TCG filter from feedStore
 */
const useAutocompleteSearch = (): UseAutocompleteSearchReturn => {
  const tcg = useFeedStore((s) => s.filters.tcg);
  const [query, setQueryRaw] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setQuery = useCallback((text: string) => {
    setQueryRaw(text);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (text.trim().length < 2) {
      setIsDropdownOpen(false);
    }
    timerRef.current = setTimeout(() => {
      setDebouncedQuery(text.trim());
      if (text.trim().length >= 2) {
        setIsDropdownOpen(true);
      }
    }, DEBOUNCE_MS);
  }, []);

  const clearQuery = useCallback(() => {
    setQueryRaw('');
    setDebouncedQuery('');
    setIsDropdownOpen(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  // Search needs a TCG — default to pokemon if none selected
  const searchTcg: TcgType = tcg ?? 'pokemon';
  const enabled = debouncedQuery.length >= 2;

  const { data: results = [], isLoading } = useQuery<NormalizedCard[], Error>({
    queryKey: ['card-search', searchTcg, debouncedQuery],
    queryFn: () => cardDataService.searchCards(debouncedQuery, searchTcg),
    enabled,
    staleTime: 1000 * 60 * 10,
  });

  const previewResults = useMemo(
    () => results.slice(0, MAX_PREVIEW),
    [results],
  );

  const hasMore = results.length > MAX_PREVIEW;

  return {
    query,
    setQuery,
    clearQuery,
    isDropdownOpen,
    setIsDropdownOpen,
    previewResults,
    hasMore,
    isLoading: isLoading && enabled,
    totalResults: results.length,
  };
};

export default useAutocompleteSearch;
