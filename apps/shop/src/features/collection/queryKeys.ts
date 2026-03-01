import type { z } from 'zod';
import type { TcgTypeSchema, CardConditionSchema } from '@tcg-trade-hub/database';

type CollectionFilters = {
  tcg?: z.infer<typeof TcgTypeSchema>;
  condition?: z.infer<typeof CardConditionSchema>;
  is_wishlist?: boolean;
  is_tradeable?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
};

export const collectionKeys = {
  all: ['collection'] as const,
  lists: () => [...collectionKeys.all, 'list'] as const,
  list: (filters: CollectionFilters) => [...collectionKeys.lists(), filters] as const,
  summary: () => [...collectionKeys.all, 'summary'] as const,
};
