import { os } from '../../base';
import { requireAuth } from '../../middleware/requireAuth';
import sendMessage, {
  SendMessageInputSchema,
  SendMessageResultSchema,
} from '../../pipelines/sendMessage/sendMessage';

export const sendMessageProcedure = os
  .input(SendMessageInputSchema)
  .output(SendMessageResultSchema)
  .handler(async ({ input, context }) => {
    const authed = requireAuth(context);
    return sendMessage.execute(input, {
      supabase: authed.supabase,
      userId: authed.userId,
    });
  });
