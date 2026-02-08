import type { TcgType, ListingType, CardCondition } from '@tcg-trade-hub/database';

type FeedFiltersParam = {
  tcg?: TcgType | null;
  listingType?: ListingType | null;
  condition?: CardCondition | null;
  sort?: string;
};

export const feedKeys = {
  all: ['feed'] as const,
  lists: () => [...feedKeys.all, 'list'] as const,
  list: (filters: FeedFiltersParam) => [...feedKeys.all, 'list', filters] as const,
  details: () => [...feedKeys.all, 'detail'] as const,
  detail: (id: string) => [...feedKeys.all, 'detail', id] as const,
};
