import type { z } from 'zod';
import type { ListingStatusSchema } from '@tcg-trade-hub/database';

type ListingFilters = {
  status?: z.infer<typeof ListingStatusSchema>;
  limit?: number;
  offset?: number;
};

export const listingKeys = {
  all: ['listings'] as const,
  lists: () => [...listingKeys.all, 'list'] as const,
  list: (filters: ListingFilters) => [...listingKeys.lists(), filters] as const,
  details: () => [...listingKeys.all, 'detail'] as const,
  detail: (id: string) => [...listingKeys.details(), id] as const,
};
