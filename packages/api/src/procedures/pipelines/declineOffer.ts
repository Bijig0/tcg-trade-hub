import { os } from '../../base';
import { requireAuth } from '../../middleware/requireAuth';
import declineOffer, {
  DeclineOfferInputSchema,
  DeclineOfferResultSchema,
} from '../../pipelines/declineOffer/declineOffer';

export const declineOfferProcedure = os
  .input(DeclineOfferInputSchema)
  .output(DeclineOfferResultSchema)
  .handler(async ({ input, context }) => {
    const authed = requireAuth(context);
    return declineOffer.execute(input, {
      supabase: authed.supabase,
      userId: authed.userId,
    });
  });
