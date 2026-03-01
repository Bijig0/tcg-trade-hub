import { os } from '../../base';
import { TcgTypeSchema } from '@tcg-trade-hub/database';
import { z } from 'zod';
import { requireAuth } from '../../middleware/requireAuth';

const OutputSchema = z.object({
  total_value: z.number(),
  total_items: z.number(),
  by_tcg: z.array(z.object({
    tcg: TcgTypeSchema,
    value: z.number(),
    count: z.number(),
  })),
});

export const portfolioSummary = os
  .output(OutputSchema)
  .handler(async ({ context }) => {
    const { supabase, userId } = requireAuth(context);

    const { data, error } = await supabase
      .from('collection_items')
      .select('tcg, market_price, quantity')
      .eq('user_id', userId)
      .eq('is_wishlist', false);

    if (error) {
      throw new Error(`Failed to get portfolio summary: ${error.message}`);
    }

    const items = data ?? [];
    let total_value = 0;
    let total_items = 0;
    const tcgMap = new Map<string, { value: number; count: number }>();

    for (const item of items) {
      const itemValue = (item.market_price ?? 0) * item.quantity;
      total_value += itemValue;
      total_items += item.quantity;

      const entry = tcgMap.get(item.tcg) ?? { value: 0, count: 0 };
      entry.value += itemValue;
      entry.count += item.quantity;
      tcgMap.set(item.tcg, entry);
    }

    const by_tcg = Array.from(tcgMap.entries()).map(([tcg, { value, count }]) => ({
      tcg: tcg as z.infer<typeof TcgTypeSchema>,
      value,
      count,
    }));

    return { total_value, total_items, by_tcg };
  });
