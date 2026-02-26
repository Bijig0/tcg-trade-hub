import { os } from '../../base';
import { requireAuth } from '../../middleware/requireAuth';
import expireListing, {
  ExpireListingInputSchema,
  ExpireListingResultSchema,
} from '../../pipelines/expireListing/expireListing';

export const expireListingProcedure = os
  .input(ExpireListingInputSchema)
  .output(ExpireListingResultSchema)
  .handler(async ({ input, context }) => {
    const authed = requireAuth(context);
    return expireListing.execute(input, {
      supabase: authed.supabase,
      userId: authed.userId,
    });
  });
