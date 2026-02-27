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

    // Grant shop_owner role (non-fatal — shop record exists regardless)
    if (context.adminSupabase) {
      const { error: roleError } = await context.adminSupabase.rpc('add_user_role', {
        target_user_id: userId,
        role_to_add: 'shop_owner',
      });
      if (roleError) {
        console.error('[shop.register] Failed to grant shop_owner role:', roleError.message);
      }
    }

    return { shop: data };
  });
