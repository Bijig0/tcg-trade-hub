import { os } from '../../base';
import { CollectionItemInsertSchema, CollectionItemRowSchema } from '@tcg-trade-hub/database';
import { z } from 'zod';
import { requireAuth } from '../../middleware/requireAuth';

export const add = os
  .input(CollectionItemInsertSchema)
  .output(z.object({ item: CollectionItemRowSchema }))
  .handler(async ({ input, context }) => {
    const { supabase, userId } = requireAuth(context);

    const { data, error } = await supabase
      .from('collection_items')
      .insert({ ...input, user_id: userId })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to add collection item: ${error.message}`);
    }

    return { item: data };
  });
