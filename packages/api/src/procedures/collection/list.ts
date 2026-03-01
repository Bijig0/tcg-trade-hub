import { os } from '../../base';
import { CollectionItemRowSchema, TcgTypeSchema, CardConditionSchema } from '@tcg-trade-hub/database';
import { z } from 'zod';
import { requireAuth } from '../../middleware/requireAuth';

const InputSchema = z.object({
  tcg: TcgTypeSchema.optional(),
  condition: CardConditionSchema.optional(),
  is_wishlist: z.boolean().optional(),
  is_tradeable: z.boolean().optional(),
  search: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(50),
  offset: z.number().int().min(0).default(0),
});

const OutputSchema = z.object({
  items: z.array(CollectionItemRowSchema),
  total: z.number(),
});

export const list = os
  .input(InputSchema)
  .output(OutputSchema)
  .handler(async ({ input, context }) => {
    const { supabase, userId } = requireAuth(context);

    let query = supabase
      .from('collection_items')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);

    if (input.tcg) query = query.eq('tcg', input.tcg);
    if (input.condition) query = query.eq('condition', input.condition);
    if (input.is_wishlist !== undefined) query = query.eq('is_wishlist', input.is_wishlist);
    if (input.is_tradeable !== undefined) query = query.eq('is_tradeable', input.is_tradeable);
    if (input.search) query = query.ilike('card_name', `%${input.search}%`);

    query = query
      .order('updated_at', { ascending: false })
      .range(input.offset, input.offset + input.limit - 1);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to list collection: ${error.message}`);
    }

    return { items: data ?? [], total: count ?? 0 };
  });
