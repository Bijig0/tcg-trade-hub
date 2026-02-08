import { z } from 'zod';
import {
  ListingTypeSchema,
  TcgTypeSchema,
  CardConditionSchema,
} from '@tcg-trade-hub/database';

/**
 * Schema for the create listing form.
 *
 * Derived from ListingInsertSchema but adapted for the multi-step form flow:
 * - user_id is omitted (injected at submission time from auth context)
 * - card fields come from the selected NormalizedCard
 * - photos are local URIs that get uploaded before insert
 */
export const CreateListingFormSchema = z.object({
  type: ListingTypeSchema,
  tcg: TcgTypeSchema,
  card_name: z.string().min(1, 'Card name is required'),
  card_set: z.string().min(1, 'Card set is required'),
  card_number: z.string().min(1, 'Card number is required'),
  card_external_id: z.string().min(1),
  card_image_url: z.string().url(),
  card_rarity: z.string().nullable().optional(),
  card_market_price: z.number().nullable().optional(),
  condition: CardConditionSchema,
  asking_price: z
    .number()
    .positive('Price must be greater than 0')
    .nullable()
    .optional(),
  description: z.string().max(500, 'Description must be 500 characters or less').nullable().optional(),
  photos: z.array(z.string()).max(6, 'Maximum 6 photos').default([]),
});

export type CreateListingForm = z.infer<typeof CreateListingFormSchema>;
