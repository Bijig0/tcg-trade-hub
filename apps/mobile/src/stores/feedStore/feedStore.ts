import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { TcgType, CardCondition } from '@tcg-trade-hub/database';

type FeedSort = 'relevance' | 'distance' | 'price' | 'newest';
type ViewMode = 'list' | 'swipe';

type FeedFilters = {
  tcg: TcgType | null;
  /** Show listings that accept cash (searcher intent: "I want to buy") */
  wantToBuy: boolean;
  /** Show listings that accept trades (searcher intent: "I want to trade") */
  wantToTrade: boolean;
  condition: CardCondition | null;
  sort: FeedSort;
  searchQuery: string;
};

type FeedState = {
  viewMode: ViewMode;
  filters: FeedFilters;
  setViewMode: (mode: ViewMode) => void;
  setFilter: <K extends keyof FeedFilters>(key: K, value: FeedFilters[K]) => void;
  toggleWantToBuy: () => void;
  toggleWantToTrade: () => void;
  setSearchQuery: (query: string) => void;
  resetFilters: () => void;
};

const DEFAULT_FILTERS: FeedFilters = {
  tcg: null,
  wantToBuy: false,
  wantToTrade: false,
  condition: null,
  sort: 'relevance',
  searchQuery: '',
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
    toggleWantToBuy: () =>
      set((state) => {
        state.filters.wantToBuy = !state.filters.wantToBuy;
      }),
    toggleWantToTrade: () =>
      set((state) => {
        state.filters.wantToTrade = !state.filters.wantToTrade;
      }),
    setSearchQuery: (query) =>
      set((state) => {
        state.filters.searchQuery = query;
      }),
    resetFilters: () =>
      set((state) => {
        state.filters = { ...DEFAULT_FILTERS };
      }),
  })),
);
