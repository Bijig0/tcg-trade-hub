import { os } from '../../../base';
import { ShopNotificationRowSchema } from '@tcg-trade-hub/database';
import { z } from 'zod';
import { requireAuth } from '../../../middleware/requireAuth';

export const list = os
  .input(z.object({
    shop_id: z.string().uuid(),
    limit: z.number().int().positive().max(100).optional(),
  }))
  .output(z.object({ notifications: z.array(ShopNotificationRowSchema) }))
  .handler(async ({ input, context }) => {
    const { supabase } = requireAuth(context);
    const limit = input.limit ?? 50;

    const { data, error } = await supabase
      .from('shop_notifications')
      .select('*')
      .eq('shop_id', input.shop_id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to list notifications: ${error.message}`);
    }

    return { notifications: data ?? [] };
  });
