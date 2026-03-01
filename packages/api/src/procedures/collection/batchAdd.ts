import { os } from '../../base';
import { CollectionItemInsertSchema } from '@tcg-trade-hub/database';
import { z } from 'zod';
import { requireAuth } from '../../middleware/requireAuth';

const InputSchema = z.object({
  items: z.array(CollectionItemInsertSchema).min(1).max(500),
});

const OutputSchema = z.object({
  inserted_count: z.number(),
});

export const batchAdd = os
  .input(InputSchema)
  .output(OutputSchema)
  .handler(async ({ input, context }) => {
    const { supabase, userId } = requireAuth(context);

    const rows = input.items.map((item) => ({ ...item, user_id: userId }));

    const { data, error } = await supabase
      .from('collection_items')
      .upsert(rows, { onConflict: 'user_id,external_id,condition' })
      .select('id');

    if (error) {
      throw new Error(`Failed to batch add collection items: ${error.message}`);
    }

    return { inserted_count: data?.length ?? 0 };
  });
