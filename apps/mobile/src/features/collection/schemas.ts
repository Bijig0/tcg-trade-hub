import { z } from 'zod';
import { TcgTypeSchema, CardConditionSchema } from '@tcg-trade-hub/database';

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
});

export type AddCollectionItem = z.infer<typeof AddCollectionItemSchema>;

export const CsvImportRowSchema = z.object({
  name: z.string(),
  set: z.string().optional(),
  number: z.string().optional(),
  condition: z.string().optional(),
  quantity: z.coerce.number().int().positive().default(1),
});
