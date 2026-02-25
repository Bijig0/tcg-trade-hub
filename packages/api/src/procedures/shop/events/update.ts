import { os } from '../../../base';
import { ShopEventUpdateSchema, ShopEventRowSchema, ShopEventStatusSchema } from '@tcg-trade-hub/database';
import { z } from 'zod';
import { requireAuth } from '../../../middleware/requireAuth';

export const update = os
  .input(z.object({ id: z.string().uuid(), status: ShopEventStatusSchema.optional() }).merge(ShopEventUpdateSchema))
  .output(z.object({ event: ShopEventRowSchema }))
  .handler(async ({ input, context }) => {
    const { supabase, userId } = requireAuth(context);
    const { id, ...updates } = input;

    // Verify ownership via shop
    const { data: event } = await supabase
      .from('shop_events')
      .select('shop_id')
      .eq('id', id)
      .single();

    if (!event) {
      throw new Error('Event not found');
    }

    const { data: shop } = await supabase
      .from('shops')
      .select('id')
      .eq('id', event.shop_id)
      .eq('owner_id', userId)
      .single();

    if (!shop) {
      throw new Error('Not authorized to update this event');
    }

    const { data, error } = await supabase
      .from('shop_events')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update event: ${error.message}`);
    }

    return { event: data };
  });
