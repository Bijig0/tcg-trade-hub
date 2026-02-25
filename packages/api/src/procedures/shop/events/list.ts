import { os } from '../../../base';
import { ShopEventRowSchema } from '@tcg-trade-hub/database';
import { z } from 'zod';
import { requireAuth } from '../../../middleware/requireAuth';

export const list = os
  .input(z.object({ shop_id: z.string().uuid() }))
  .output(z.object({ events: z.array(ShopEventRowSchema) }))
  .handler(async ({ input, context }) => {
    const { supabase } = requireAuth(context);

    const { data, error } = await supabase
      .from('shop_events')
      .select('*')
      .eq('shop_id', input.shop_id)
      .order('starts_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to list events: ${error.message}`);
    }

    return { events: data ?? [] };
  });
