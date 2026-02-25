import { os } from '../../base';
import { ShopRowSchema } from '@tcg-trade-hub/database';
import { z } from 'zod';
import { requireAuth } from '../../middleware/requireAuth';

export const get = os
  .input(z.void())
  .output(z.object({ shop: ShopRowSchema.nullable() }))
  .handler(async ({ context }) => {
    const { supabase, userId } = requireAuth(context);

    const { data, error } = await supabase
      .from('shops')
      .select('*')
      .eq('owner_id', userId)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to get shop: ${error.message}`);
    }

    return { shop: data };
  });
