import { os } from '../../base';
import {
  ListingRowSchema,
  ListingItemRowSchema,
  ListingStatusSchema,
} from '@tcg-trade-hub/database';
import { z } from 'zod';
import { requireAuth } from '../../middleware/requireAuth';

const InputSchema = z.object({
  status: ListingStatusSchema.optional(),
  limit: z.number().int().min(1).max(100).default(50),
  offset: z.number().int().min(0).default(0),
});

const ListingWithItemsSchema = ListingRowSchema.extend({
  listing_items: z.array(ListingItemRowSchema),
  offer_count: z.number(),
});

const OutputSchema = z.object({
  listings: z.array(ListingWithItemsSchema),
  total: z.number(),
});

export const myList = os
  .input(InputSchema)
  .output(OutputSchema)
  .handler(async ({ input, context }) => {
    const { supabase, userId } = requireAuth(context);

    let query = supabase
      .from('listings')
      .select('*, listing_items(*), offers(id)', { count: 'exact' })
      .eq('user_id', userId);

    if (input.status) query = query.eq('status', input.status);

    query = query
      .order('created_at', { ascending: false })
      .range(input.offset, input.offset + input.limit - 1);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to list listings: ${error.message}`);
    }

    const listings = (data ?? []).map((listing) => ({
      ...listing,
      listing_items: listing.listing_items ?? [],
      offer_count: Array.isArray(listing.offers) ? listing.offers.length : 0,
      offers: undefined,
    }));

    return { listings, total: count ?? 0 };
  });
