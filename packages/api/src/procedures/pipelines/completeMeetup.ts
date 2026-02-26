import { os } from '../../base';
import { requireAuth } from '../../middleware/requireAuth';
import completeMeetup, {
  CompleteMeetupInputSchema,
  CompleteMeetupResultSchema,
} from '../../pipelines/completeMeetup/completeMeetup';

export const completeMeetupProcedure = os
  .input(CompleteMeetupInputSchema)
  .output(CompleteMeetupResultSchema)
  .handler(async ({ input, context }) => {
    const authed = requireAuth(context);
    return completeMeetup.execute(input, {
      supabase: authed.supabase,
      userId: authed.userId,
    });
  });
