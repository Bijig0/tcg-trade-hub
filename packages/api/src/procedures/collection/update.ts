import { os } from '../../base';
import { CollectionItemUpdateSchema, CollectionItemRowSchema } from '@tcg-trade-hub/database';
import { z } from 'zod';
import { requireAuth } from '../../middleware/requireAuth';

const InputSchema = z.object({
  id: z.string().uuid(),
}).merge(CollectionItemUpdateSchema);

export const update = os
  .input(InputSchema)
  .output(z.object({ item: CollectionItemRowSchema }))
  .handler(async ({ input, context }) => {
    const { supabase, userId } = requireAuth(context);
    const { id, ...fields } = input;

    const { data, error } = await supabase
      .from('collection_items')
      .update(fields)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update collection item: ${error.message}`);
    }

    return { item: data };
  });
