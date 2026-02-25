import { os } from '../../../base';
import { ShopEventInsertSchema, ShopEventRowSchema } from '@tcg-trade-hub/database';
import { z } from 'zod';
import { requireAuth } from '../../../middleware/requireAuth';

export const create = os
  .input(ShopEventInsertSchema)
  .output(z.object({ event: ShopEventRowSchema }))
  .handler(async ({ input, context }) => {
    const { supabase, userId } = requireAuth(context);

    // Verify shop ownership
    const { data: shop } = await supabase
      .from('shops')
      .select('id')
      .eq('id', input.shop_id)
      .eq('owner_id', userId)
      .single();

    if (!shop) {
      throw new Error('Shop not found or not owned by you');
    }

    const { data, error } = await supabase
      .from('shop_events')
      .insert(input)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create event: ${error.message}`);
    }

    return { event: data };
  });
