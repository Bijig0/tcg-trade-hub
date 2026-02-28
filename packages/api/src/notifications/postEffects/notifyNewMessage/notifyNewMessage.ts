import type { PostEffect } from '../../../pipelines/definePipeline/definePipeline';
import type { SendMessageInput, SendMessageResult } from '../../../pipelines/sendMessage/sendMessage';

/**
 * Sends a push notification to the recipient after a new message is sent.
 * Fires as a post-effect -- failures are logged but do not roll back the message.
 */
export const notifyNewMessage: PostEffect<SendMessageInput, SendMessageResult> = {
  name: 'notifyNewMessage',
  run: async (_input, result, context) => {
    await context.supabase.functions.invoke('send-push-notification', {
      body: {
        recipientId: result.recipient_id,
        type: 'new_message',
        data: {
          conversationId: result.conversation_id,
          messageId: result.message_id,
          senderId: result.sender_id,
        },
      },
    });
  },
};
