import { z } from 'zod';
import definePipeline from '../definePipeline/definePipeline';
import type { PreCheck } from '../definePipeline/definePipeline';

const OfferItemSchema = z.object({
  card_name: z.string(),
  card_image_url: z.string(),
  card_external_id: z.string(),
  tcg: z.string(),
  card_set: z.string().nullable(),
  card_number: z.string().nullable(),
  condition: z.string(),
  market_price: z.number().nullable(),
  quantity: z.number().int().positive().default(1),
});

const CreateOfferInputSchema = z.object({
  listingId: z.string().uuid(),
  cashAmount: z.number().min(0),
  offeringNote: z.string().nullable(),
  items: z.array(OfferItemSchema),
});

type CreateOfferInput = z.infer<typeof CreateOfferInputSchema>;

const CreateOfferResultSchema = z.object({
  offer_id: z.string().uuid(),
});

type CreateOfferResult = z.infer<typeof CreateOfferResultSchema>;

/**
 * Verifies the listing is active and the user isn't offering on their own listing.
 */
const checkListingActive: PreCheck<CreateOfferInput> = {
  name: 'checkListingActive',
  run: async (input, ctx) => {
    const { data: listing, error } = await ctx.supabase
      .from('listings')
      .select('user_id, status')
      .eq('id', input.listingId)
      .single();

    if (error || !listing) throw new Error('Listing not found');
    if (listing.status !== 'active') throw new Error(`Listing is not active (current: ${listing.status})`);
    if (listing.user_id === ctx.userId) throw new Error('Cannot offer on your own listing');
  },
};

/**
 * Creates an offer and its items atomically.
 * Validates listing is active and user isn't offering on their own listing.
 */
const createOffer = definePipeline({
  name: 'createOffer',
  description:
    'Creates an offer on a listing with optional card items, atomically. ' +
    'Validates listing is active and offerer is not the listing owner.',

  inputSchema: CreateOfferInputSchema,

  preChecks: [checkListingActive],

  rpc: {
    functionName: 'create_offer_v1',
    mapParams: (input, ctx) => ({
      p_listing_id: input.listingId,
      p_offerer_id: ctx.userId,
      p_cash_amount: input.cashAmount,
      p_offerer_note: input.offeringNote,
      p_items: JSON.stringify(input.items),
    }),
    resultSchema: CreateOfferResultSchema,
  },

  postEffects: [],
});

export default createOffer;
export { CreateOfferInputSchema, CreateOfferResultSchema, OfferItemSchema, checkListingActive };
export type { CreateOfferInput, CreateOfferResult };
