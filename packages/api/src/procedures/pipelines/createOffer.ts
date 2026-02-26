import { os } from '../../base';
import { requireAuth } from '../../middleware/requireAuth';
import createOffer, {
  CreateOfferInputSchema,
  CreateOfferResultSchema,
} from '../../pipelines/createOffer/createOffer';

export const createOfferProcedure = os
  .input(CreateOfferInputSchema)
  .output(CreateOfferResultSchema)
  .handler(async ({ input, context }) => {
    const authed = requireAuth(context);
    return createOffer.execute(input, {
      supabase: authed.supabase,
      userId: authed.userId,
    });
  });
