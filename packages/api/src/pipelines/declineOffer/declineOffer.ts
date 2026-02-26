import { z } from 'zod';
import definePipeline from '../definePipeline/definePipeline';
import type { PreCheck } from '../definePipeline/definePipeline';
import { assertTransition } from '@tcg-trade-hub/database';
import type { OfferStatus } from '@tcg-trade-hub/database';

const DeclineOfferInputSchema = z.object({
  offerId: z.string().uuid(),
  listingId: z.string().uuid(),
});

type DeclineOfferInput = z.infer<typeof DeclineOfferInputSchema>;

const DeclineOfferResultSchema = z.object({
  success: z.boolean(),
});

type DeclineOfferResult = z.infer<typeof DeclineOfferResultSchema>;

const checkListingOwnership: PreCheck<DeclineOfferInput> = {
  name: 'checkListingOwnership',
  run: async (input, ctx) => {
    const { data: listing, error } = await ctx.supabase
      .from('listings')
      .select('user_id')
      .eq('id', input.listingId)
      .single();

    if (error || !listing) throw new Error('Listing not found');
    if (listing.user_id !== ctx.userId) throw new Error('Only the listing owner can decline offers');
  },
};

const checkOfferActionable: PreCheck<DeclineOfferInput> = {
  name: 'checkOfferActionable',
  run: async (input, ctx) => {
    const { data: offer, error } = await ctx.supabase
      .from('offers')
      .select('id, listing_id, status')
      .eq('id', input.offerId)
      .single();

    if (error || !offer) throw new Error('Offer not found');
    if (offer.listing_id !== input.listingId) throw new Error('Offer does not belong to this listing');
    assertTransition('offer', offer.status as OfferStatus, 'declined');
  },
};

/**
 * Declines a single offer. Only the listing owner can decline.
 */
const declineOffer = definePipeline({
  name: 'declineOffer',
  description: 'Declines a single offer on a listing. Only the listing owner can decline.',

  inputSchema: DeclineOfferInputSchema,

  preChecks: [checkListingOwnership, checkOfferActionable],

  rpc: {
    functionName: 'decline_offer_v1',
    mapParams: (input, ctx) => ({
      p_offer_id: input.offerId,
      p_user_id: ctx.userId,
    }),
    resultSchema: DeclineOfferResultSchema,
  },

  postEffects: [],
});

export default declineOffer;
export { DeclineOfferInputSchema, DeclineOfferResultSchema, checkListingOwnership, checkOfferActionable };
export type { DeclineOfferInput, DeclineOfferResult };
