import { z } from 'zod';
import definePipeline from '../definePipeline/definePipeline';
import type { PipelineContext, PreCheck } from '../definePipeline/definePipeline';
import { assertTransition } from '@tcg-trade-hub/database';
import type { OfferStatus, ListingStatus } from '@tcg-trade-hub/database';

const AcceptOfferInputSchema = z.object({
  offerId: z.string().uuid(),
  listingId: z.string().uuid(),
});

type AcceptOfferInput = z.infer<typeof AcceptOfferInputSchema>;

const AcceptOfferResultSchema = z.object({
  match_id: z.string().uuid(),
  conversation_id: z.string().uuid(),
  declined_offer_count: z.number().int(),
});

type AcceptOfferResult = z.infer<typeof AcceptOfferResultSchema>;

/**
 * Verifies the current user owns the listing and it can transition to 'matched'.
 */
const checkListingOwnership: PreCheck<AcceptOfferInput> = {
  name: 'checkListingOwnership',
  run: async (input, ctx) => {
    const { data: listing, error } = await ctx.supabase
      .from('listings')
      .select('user_id, status')
      .eq('id', input.listingId)
      .single();

    if (error || !listing) throw new Error('Listing not found');
    if (listing.user_id !== ctx.userId) throw new Error('Only the listing owner can accept offers');
    assertTransition('listing', listing.status as ListingStatus, 'matched');
  },
};

/**
 * Verifies the offer exists, belongs to this listing, and is actionable.
 */
const checkOfferActionable: PreCheck<AcceptOfferInput> = {
  name: 'checkOfferActionable',
  run: async (input, ctx) => {
    const { data: offer, error } = await ctx.supabase
      .from('offers')
      .select('id, listing_id, status')
      .eq('id', input.offerId)
      .single();

    if (error || !offer) throw new Error('Offer not found');
    if (offer.listing_id !== input.listingId) throw new Error('Offer does not belong to this listing');
    assertTransition('offer', offer.status as OfferStatus, 'accepted');
  },
};

/**
 * Accepts an offer on a listing. Atomically:
 * - Updates offer to accepted
 * - Declines all other pending/countered offers on the same listing
 * - Creates a match and conversation
 * - Updates listing to matched status
 */
const acceptOffer = definePipeline({
  name: 'acceptOffer',
  description:
    'Accepts an offer on a listing. Atomically: updates offer to accepted, ' +
    'declines all other pending/countered offers on the same listing, ' +
    'creates a match and conversation, updates listing to matched status.',

  inputSchema: AcceptOfferInputSchema,

  preChecks: [checkListingOwnership, checkOfferActionable],

  rpc: {
    functionName: 'accept_offer_v1',
    mapParams: (input, ctx) => ({
      p_offer_id: input.offerId,
      p_listing_id: input.listingId,
      p_user_id: ctx.userId,
    }),
    resultSchema: AcceptOfferResultSchema,
  },

  postEffects: [],
});

export default acceptOffer;
export { AcceptOfferInputSchema, AcceptOfferResultSchema, checkListingOwnership, checkOfferActionable };
export type { AcceptOfferInput, AcceptOfferResult };
