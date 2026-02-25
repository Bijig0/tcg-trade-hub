import { os } from '../../base';
import { ShopUpdateSchema, ShopRowSchema } from '@tcg-trade-hub/database';
import { z } from 'zod';
import { requireAuth } from '../../middleware/requireAuth';

export const update = os
  .input(ShopUpdateSchema)
  .output(z.object({ shop: ShopRowSchema }))
  .handler(async ({ input, context }) => {
    const { supabase, userId } = requireAuth(context);

    const { data, error } = await supabase
      .from('shops')
      .update(input)
      .eq('owner_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update shop: ${error.message}`);
    }

    return { shop: data };
  });
