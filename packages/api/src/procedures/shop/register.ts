import { os } from '../../base';
import { ShopInsertSchema, ShopRowSchema } from '@tcg-trade-hub/database';
import { z } from 'zod';
import { requireAuth } from '../../middleware/requireAuth';

export const register = os
  .input(ShopInsertSchema.omit({ owner_id: true }))
  .output(z.object({ shop: ShopRowSchema }))
  .handler(async ({ input, context }) => {
    const { supabase, userId } = requireAuth(context);

    const { data, error } = await supabase
      .from('shops')
      .insert({ ...input, owner_id: userId })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error('You already own a shop');
      }
      throw new Error(`Failed to register shop: ${error.message}`);
    }

    return { shop: data };
  });
