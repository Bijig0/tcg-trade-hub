import { os } from '../base';
import { TcgTypeSchema, NormalizedCardSchema } from '@tcg-trade-hub/database';
import { z } from 'zod';
import { getMockCards } from '../mock/cards';

export const search = os
  .input(z.object({ query: z.string().min(1), tcg: TcgTypeSchema }))
  .output(z.array(NormalizedCardSchema))
  .handler(async ({ input }) => {
    // TODO: Swap to Scrydex API call when available
    return getMockCards(input.query, input.tcg);
  });
