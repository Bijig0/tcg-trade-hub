import { z } from 'zod';
import definePipeline from '../definePipeline/definePipeline';
import type { PreCheck } from '../definePipeline/definePipeline';
import { assertTransition } from '@tcg-trade-hub/database';
import type { ListingStatus } from '@tcg-trade-hub/database';

const ExpireListingInputSchema = z.object({
  listingId: z.string().uuid(),
});

type ExpireListingInput = z.infer<typeof ExpireListingInputSchema>;

const ExpireListingResultSchema = z.object({
  success: z.boolean(),
  withdrawn_offer_count: z.number().int(),
});

type ExpireListingResult = z.infer<typeof ExpireListingResultSchema>;

const checkListingOwnership: PreCheck<ExpireListingInput> = {
  name: 'checkListingOwnership',
  run: async (input, ctx) => {
    const { data: listing, error } = await ctx.supabase
      .from('listings')
      .select('user_id, status')
      .eq('id', input.listingId)
      .single();

    if (error || !listing) throw new Error('Listing not found');
    if (listing.user_id !== ctx.userId) throw new Error('Only the listing owner can expire a listing');
    assertTransition('listing', listing.status as ListingStatus, 'expired');
  },
};

/**
 * Soft-deletes a listing by setting status to 'expired'.
 * Also withdraws any pending/countered offers on the listing.
 */
const expireListing = definePipeline({
  name: 'expireListing',
  description:
    'Soft-deletes a listing by transitioning to expired status. ' +
    'Atomically withdraws any pending/countered offers on the listing.',

  inputSchema: ExpireListingInputSchema,

  preChecks: [checkListingOwnership],

  rpc: {
    functionName: 'expire_listing_v1',
    mapParams: (input, ctx) => ({
      p_listing_id: input.listingId,
      p_user_id: ctx.userId,
    }),
    resultSchema: ExpireListingResultSchema,
  },

  postEffects: [],
});

export default expireListing;
export { ExpireListingInputSchema, ExpireListingResultSchema, checkListingOwnership };
export type { ExpireListingInput, ExpireListingResult };
