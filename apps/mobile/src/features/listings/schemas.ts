import { z } from 'zod';
import {
  ListingTypeSchema,
  TcgTypeSchema,
  CardConditionSchema,
  NormalizedCardSchema,
  CardRefSchema,
} from '@tcg-trade-hub/database';

/**
 * Schema for the create listing form (WTB flow — unchanged).
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
  addToCollection: z.boolean().default(false),
});

export type CreateListingForm = z.infer<typeof CreateListingFormSchema>;

// --- WTS/WTT multi-card types ---

/**
 * A card selected for WTS/WTT listing creation.
 * Tracks origin (collection vs external search) and condition.
 */
export const SelectedCardSchema = z.object({
  card: NormalizedCardSchema,
  condition: CardConditionSchema,
  fromCollection: z.boolean(),
  addToCollection: z.boolean(),
  askingPrice: z.string().default(''),
});

export type SelectedCard = z.infer<typeof SelectedCardSchema>;

/**
 * A card wanted in return for a WTT trade.
 */
export const WantedCardSchema = z.object({
  card: NormalizedCardSchema,
});

export type WantedCard = z.infer<typeof WantedCardSchema>;

/**
 * The trade_wants JSONB payload stored on WTT listing rows.
 * Array of CardRef objects with optional market price.
 */
export const TradeWantsPayloadSchema = z.array(
  CardRefSchema.extend({
    marketPrice: z.number().nullable().optional(),
  }),
);

export type TradeWantsPayload = z.infer<typeof TradeWantsPayloadSchema>;

/**
 * Validation schema for the bulk WTS form submission.
 * Each selected card becomes its own listing row.
 */
export const BulkWtsFormSchema = z.object({
  type: z.literal('wts'),
  selectedCards: z.array(SelectedCardSchema).min(1, 'Select at least one card'),
});

export type BulkWtsForm = z.infer<typeof BulkWtsFormSchema>;

/**
 * Validation schema for the WTT form submission.
 * Offered cards become listing rows; wanted cards go into trade_wants JSONB.
 */
export const WttFormSchema = z.object({
  type: z.literal('wtt'),
  selectedCards: z.array(SelectedCardSchema).min(1, 'Select at least one card to offer'),
  wantedCards: z.array(WantedCardSchema).min(1, 'Select at least one card you want'),
});

export type WttForm = z.infer<typeof WttFormSchema>;
