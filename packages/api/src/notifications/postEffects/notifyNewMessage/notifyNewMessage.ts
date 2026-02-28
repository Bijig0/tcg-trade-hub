import type { PostEffect } from '../../../pipelines/definePipeline/definePipeline';
import sendPushNotification from '../../sendPushNotification/sendPushNotification';
import formatNotificationBody from '../../formatNotificationBody/formatNotificationBody';

type NewMessageInput = {
  type: string;
  body: string | null;
};

type NewMessageResult = {
  recipient_id: string;
};

/**
 * Sends a push notification to the message recipient.
 * Uses formatNotificationBody to build appropriate title/body based on message type.
 * Skips system messages (they are not user-initiated).
 */
const notifyNewMessage: PostEffect<NewMessageInput, NewMessageResult> = {
  name: 'notifyNewMessage',
  run: async (input, result, context) => {
    // System messages are not user-initiated, skip notification
    if (input.type === 'system') return;

    const sb = context.adminSupabase ?? context.supabase;

    const { data: sender } = await sb
      .from('profiles')
      .select('display_name')
      .eq('id', context.userId)
      .single();

    const senderName = sender?.display_name ?? 'Someone';
    const content = formatNotificationBody(senderName, input.type, input.body);

    await sendPushNotification(sb, {
      recipientUserId: result.recipient_id,
      title: content.title,
      body: content.body,
      data: { type: input.type },
    });
  },
};

export { notifyNewMessage };
