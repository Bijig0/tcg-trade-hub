import { os } from '../../../base';
import { z } from 'zod';
import { requireAuth } from '../../../middleware/requireAuth';

export const remove = os
  .input(z.object({ id: z.string().uuid() }))
  .output(z.object({ success: z.boolean() }))
  .handler(async ({ input, context }) => {
    const { supabase, userId } = requireAuth(context);

    // Verify ownership via shop
    const { data: event } = await supabase
      .from('shop_events')
      .select('shop_id')
      .eq('id', input.id)
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
      throw new Error('Not authorized to delete this event');
    }

    const { error } = await supabase
      .from('shop_events')
      .delete()
      .eq('id', input.id);

    if (error) {
      throw new Error(`Failed to delete event: ${error.message}`);
    }

    return { success: true };
  });
