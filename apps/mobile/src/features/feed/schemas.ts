import { z } from 'zod';
import {
  TcgTypeSchema,
  CardConditionSchema,
  ListingRowSchema,
  ListingItemRowSchema,
} from '@tcg-trade-hub/database';

export const FeedSortSchema = z.enum(['relevance', 'distance', 'price', 'newest']);
export type FeedSort = z.infer<typeof FeedSortSchema>;

export const FeedFiltersSchema = z.object({
  tcg: TcgTypeSchema.nullable().default(null),
  wantToBuy: z.boolean().default(false),
  wantToTrade: z.boolean().default(false),
  condition: CardConditionSchema.nullable().default(null),
  sort: FeedSortSchema.default('relevance'),
  searchQuery: z.string().default(''),
});

export type FeedFilters = z.infer<typeof FeedFiltersSchema>;

export const ListingOwnerSchema = z.object({
  display_name: z.string(),
  avatar_url: z.string().nullable(),
  rating_score: z.number(),
  total_trades: z.number(),
});

export type ListingOwner = z.infer<typeof ListingOwnerSchema>;

export const ListingWithDistanceSchema = ListingRowSchema.extend({
  distance_km: z.number(),
  owner: ListingOwnerSchema,
  items: z.array(ListingItemRowSchema),
  offer_count: z.number().default(0),
});

export type ListingWithDistance = z.infer<typeof ListingWithDistanceSchema>;
