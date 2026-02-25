import { os } from '../../../base';
import { z } from 'zod';
import { requireAuth } from '../../../middleware/requireAuth';

export const markRead = os
  .input(z.object({ ids: z.array(z.string().uuid()).min(1) }))
  .output(z.object({ success: z.boolean() }))
  .handler(async ({ input, context }) => {
    const { supabase } = requireAuth(context);

    const { error } = await supabase
      .from('shop_notifications')
      .update({ read: true })
      .in('id', input.ids);

    if (error) {
      throw new Error(`Failed to mark notifications as read: ${error.message}`);
    }

    return { success: true };
  });
