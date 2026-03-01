import { os } from '../../base';
import {
  ListingTypeSchema,
  TcgTypeSchema,
  ListingCategorySchema,
  ListingItemInsertSchema,
  ListingRowSchema,
  ListingItemRowSchema,
  TradeWantSchema,
} from '@tcg-trade-hub/database';
import { z } from 'zod';
import { requireAuth } from '../../middleware/requireAuth';

const InputSchema = z.object({
  type: ListingTypeSchema,
  tcg: TcgTypeSchema,
  category: ListingCategorySchema.default('singles'),
  items: z.array(ListingItemInsertSchema.omit({ listing_id: true })).min(1),
  cash_amount: z.number().default(0),
  description: z.string().nullable().optional(),
  trade_wants: z.array(TradeWantSchema).default([]),
  accepts_cash: z.boolean().default(false),
  accepts_trades: z.boolean().default(false),
});

const OutputSchema = z.object({
  listing: ListingRowSchema,
  items: z.array(ListingItemRowSchema),
});

export const create = os
  .input(InputSchema)
  .output(OutputSchema)
  .handler(async ({ input, context }) => {
    const { supabase, userId } = requireAuth(context);

    // Compute title from items
    const firstName = input.items[0]?.card_name ?? '';
    const title = input.items.length === 1
      ? firstName
      : `${firstName} + ${input.items.length - 1} more`;

    // Compute total value from asking prices
    const total_value = input.items.reduce(
      (sum, item) => sum + (item.asking_price ?? item.market_price ?? 0) * item.quantity,
      0,
    );

    // Insert listing
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .insert({
        user_id: userId,
        type: input.type,
        tcg: input.tcg,
        category: input.category,
        title,
        cash_amount: input.cash_amount,
        total_value,
        description: input.description ?? null,
        photos: [],
        trade_wants: input.trade_wants,
        accepts_cash: input.accepts_cash,
        accepts_trades: input.accepts_trades,
      })
      .select()
      .single();

    if (listingError || !listing) {
      throw new Error(`Failed to create listing: ${listingError?.message}`);
    }

    // Insert listing items
    const itemRows = input.items.map((item) => ({
      ...item,
      listing_id: listing.id,
    }));

    const { data: items, error: itemsError } = await supabase
      .from('listing_items')
      .insert(itemRows)
      .select();

    if (itemsError) {
      throw new Error(`Failed to create listing items: ${itemsError.message}`);
    }

    return { listing, items: items ?? [] };
  });
