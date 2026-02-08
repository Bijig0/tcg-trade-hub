import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { TcgType, ListingType, CardCondition } from '@tcg-trade-hub/database';

type FeedSort = 'relevance' | 'distance' | 'price' | 'newest';
type ViewMode = 'list' | 'swipe';

type FeedFilters = {
  tcg: TcgType | null;
  listingType: ListingType | null;
  condition: CardCondition | null;
  sort: FeedSort;
};

type FeedState = {
  viewMode: ViewMode;
  filters: FeedFilters;
  setViewMode: (mode: ViewMode) => void;
  setFilter: <K extends keyof FeedFilters>(key: K, value: FeedFilters[K]) => void;
  resetFilters: () => void;
};

const DEFAULT_FILTERS: FeedFilters = {
  tcg: null,
  listingType: null,
  condition: null,
  sort: 'relevance',
};

export const useFeedStore = create<FeedState>()(
  immer((set) => ({
    viewMode: 'list',
    filters: { ...DEFAULT_FILTERS },
    setViewMode: (mode) =>
      set((state) => {
        state.viewMode = mode;
      }),
    setFilter: (key, value) =>
      set((state) => {
        state.filters[key] = value;
      }),
    resetFilters: () =>
      set((state) => {
        state.filters = { ...DEFAULT_FILTERS };
      }),
  })),
);
