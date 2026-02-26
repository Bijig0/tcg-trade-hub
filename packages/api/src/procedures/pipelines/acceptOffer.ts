import { os } from '../../base';
import { requireAuth } from '../../middleware/requireAuth';
import acceptOffer, {
  AcceptOfferInputSchema,
  AcceptOfferResultSchema,
} from '../../pipelines/acceptOffer/acceptOffer';

export const acceptOfferProcedure = os
  .input(AcceptOfferInputSchema)
  .output(AcceptOfferResultSchema)
  .handler(async ({ input, context }) => {
    const authed = requireAuth(context);
    return acceptOffer.execute(input, {
      supabase: authed.supabase,
      userId: authed.userId,
    });
  });
