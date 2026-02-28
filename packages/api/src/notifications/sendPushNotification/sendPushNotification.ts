import type { SupabaseClient } from '@supabase/supabase-js';

type PushPayload = {
  recipientUserId: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
};

/** Fire-and-forget push notification via Edge Function */
const sendPushNotification = async (
  supabase: SupabaseClient,
  payload: PushPayload,
): Promise<void> => {
  try {
    await supabase.functions.invoke('send-push-notification', {
      body: { type: 'direct' as const, ...payload },
    });
  } catch (err) {
    console.error('[sendPushNotification]', err);
  }
};

export default sendPushNotification;
export type { PushPayload };
