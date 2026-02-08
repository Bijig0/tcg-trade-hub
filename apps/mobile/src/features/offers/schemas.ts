import { z } from 'zod';
import { CardRefSchema } from '@tcg-trade-hub/database';

export const CreateOfferSchema = z.object({
  offering: z.array(CardRefSchema).min(1, 'Must offer at least one card'),
  requesting: z.array(CardRefSchema).min(1, 'Must request at least one card'),
  cash_amount: z.number().positive().optional(),
  cash_direction: z.enum(['offering', 'requesting']).optional(),
  note: z.string().max(500).optional(),
});

export type CreateOffer = z.infer<typeof CreateOfferSchema>;
