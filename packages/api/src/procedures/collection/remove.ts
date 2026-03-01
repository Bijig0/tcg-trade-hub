import { os } from '../../base';
import { z } from 'zod';
import { requireAuth } from '../../middleware/requireAuth';

export const remove = os
  .input(z.object({ id: z.string().uuid() }))
  .output(z.object({ success: z.boolean() }))
  .handler(async ({ input, context }) => {
    const { supabase, userId } = requireAuth(context);

    const { error } = await supabase
      .from('collection_items')
      .delete()
      .eq('id', input.id)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to remove collection item: ${error.message}`);
    }

    return { success: true };
  });
