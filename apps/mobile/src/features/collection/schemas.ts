import { z } from 'zod';
import {
  TcgTypeSchema,
  CardConditionSchema,
  GradingCompanySchema,
  SealedProductTypeSchema,
} from '@tcg-trade-hub/database';

export const AddCollectionItemSchema = z.object({
  tcg: TcgTypeSchema,
  external_id: z.string(),
  card_name: z.string(),
  set_name: z.string(),
  set_code: z.string(),
  card_number: z.string(),
  image_url: z.string(),
  rarity: z.string().nullable().optional(),
  condition: CardConditionSchema.default('nm'),
  quantity: z.number().int().positive().default(1),
  is_wishlist: z.boolean().default(false),
  market_price: z.number().nullable().optional(),
  grading_company: GradingCompanySchema.nullable().optional(),
  grading_score: z.string().nullable().optional(),
  is_sealed: z.boolean().default(false),
  product_type: SealedProductTypeSchema.nullable().optional(),
  purchase_price: z.number().nullable().optional(),
});

export type AddCollectionItem = z.infer<typeof AddCollectionItemSchema>;

export const AddWishlistItemSchema = AddCollectionItemSchema.extend({
  is_wishlist: z.literal(true).default(true as never),
});

export type AddWishlistItem = z.infer<typeof AddWishlistItemSchema>;

export const AddSealedProductSchema = AddCollectionItemSchema.extend({
  is_sealed: z.literal(true).default(true as never),
  product_type: SealedProductTypeSchema,
});

export type AddSealedProduct = z.infer<typeof AddSealedProductSchema>;

export const CsvImportRowSchema = z.object({
  name: z.string(),
  set: z.string().optional(),
  number: z.string().optional(),
  condition: z.string().optional(),
  quantity: z.coerce.number().int().positive().default(1),
  grading_company: z.string().optional(),
  grading_score: z.string().optional(),
  purchase_price: z.coerce.number().optional(),
});
