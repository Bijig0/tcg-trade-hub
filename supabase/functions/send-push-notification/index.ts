/**
 * send-push-notification Edge Function
 *
 * Supports two invocation paths:
 * 1. **Webhook** — Triggered by a database webhook on messages INSERT.
 * 2. **Direct** — Invoked by oRPC post-effects with explicit recipient, title, body.
 *
 * Webhook payload shape (Supabase database webhook):
 * {
 *   type: 'INSERT',
 *   table: 'messages',
 *   record: MessageRow,
 *   old_record: null
 * }
 *
 * Direct payload shape:
 * {
 *   type: 'direct',
 *   recipientUserId: string,
 *   title: string,
 *   body: string,
 *   data?: Record<string, unknown>
 * }
 */
import { handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

interface DirectInvocationPayload {
  type: 'direct';
  recipientUserId: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

interface WebhookPayload {
  type: string;
  table: string;
  record: {
    id: string;
    conversation_id: string;
    sender_id: string;
    type: string;
    body: string | null;
    payload: Record<string, unknown> | null;
    created_at: string;
  };
  old_record: null;
}

type Payload = WebhookPayload | DirectInvocationPayload;

/**
 * Formats a push notification body based on the message type.
 */
function formatNotificationBody(
  senderName: string,
  messageType: string,
  body: string | null,
): { title: string; body: string } {
  switch (messageType) {
    case 'text':
      return {
        title: senderName,
        body: body ?? 'Sent a message',
      };
    case 'image':
      return {
        title: senderName,
        body: 'Sent an image',
      };
    case 'card_offer':
      return {
        title: `${senderName} - Trade Offer`,
        body: 'Sent you a card trade offer',
      };
    case 'card_offer_response':
      return {
        title: `${senderName} - Trade Response`,
        body: 'Responded to your trade offer',
      };
    case 'meetup_proposal':
      return {
        title: `${senderName} - Meetup Proposal`,
        body: 'Proposed a meetup location and time',
      };
    case 'meetup_response':
      return {
        title: `${senderName} - Meetup Response`,
        body: 'Responded to your meetup proposal',
      };
    case 'system':
      return {
        title: 'TCG Trade Hub',
        body: body ?? 'New system notification',
      };
    default:
      return {
        title: senderName,
        body: body ?? 'New message',
      };
  }
}

/**
 * Sends a push notification via the Expo Push API.
 */
async function sendExpoPush(
  token: string,
  title: string,
  body: string,
  sound: string = 'default',
  data?: Record<string, unknown>,
) {
  const pushPayload = {
    to: token,
    title,
    body,
    sound,
    data: data ?? {},
  };

  const pushRes = await fetch(EXPO_PUSH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(pushPayload),
  });

  if (!pushRes.ok) {
    const errorText = await pushRes.text();
    console.error('Expo Push API error:', errorText);
    throw new Error(`Push notification failed: ${pushRes.status}`);
  }

  return pushRes.json();
}

/**
 * Handles direct invocation: looks up the recipient's push token by user ID
 * and sends the provided title/body as a push notification.
 */
async function handleDirectInvocation(payload: DirectInvocationPayload) {
  const { data: recipient, error: recipientError } = await supabaseAdmin
    .from('users')
    .select('expo_push_token')
    .eq('id', payload.recipientUserId)
    .single();

  if (recipientError || !recipient) {
    console.error('Recipient lookup failed:', recipientError);
    return jsonResponse({ skipped: true, reason: 'recipient_not_found' });
  }

  if (!recipient.expo_push_token) {
    return jsonResponse({ skipped: true, reason: 'no_push_token' });
  }

  const ticket = await sendExpoPush(
    recipient.expo_push_token,
    payload.title,
    payload.body,
    'default',
    payload.data,
  );

  return jsonResponse({ sent: true, ticket });
}

/**
 * Handles webhook invocation: determines recipient from the conversation/match,
 * formats the notification based on message type, and sends it.
 */
async function handleWebhookInvocation(payload: WebhookPayload) {
  const message = payload.record;

  // Skip system messages from push notifications
  if (message.type === 'system') {
    return jsonResponse({ skipped: true, reason: 'system_message' });
  }

  // Get the conversation to find the match and participants
  const { data: conversation, error: convoError } = await supabaseAdmin
    .from('conversations')
    .select('match_id')
    .eq('id', message.conversation_id)
    .single();

  if (convoError || !conversation) {
    console.error('Conversation lookup failed:', convoError);
    return errorResponse('Conversation not found', 404);
  }

  // Get the match to find participants
  const { data: match, error: matchError } = await supabaseAdmin
    .from('matches')
    .select('user_a_id, user_b_id')
    .eq('id', conversation.match_id)
    .single();

  if (matchError || !match) {
    console.error('Match lookup failed:', matchError);
    return errorResponse('Match not found', 404);
  }

  // Determine the recipient (the other user in the match)
  const recipientId =
    match.user_a_id === message.sender_id
      ? match.user_b_id
      : match.user_a_id;

  // Get recipient's push token
  const { data: recipient, error: recipientError } = await supabaseAdmin
    .from('users')
    .select('expo_push_token, display_name')
    .eq('id', recipientId)
    .single();

  if (recipientError || !recipient) {
    console.error('Recipient lookup failed:', recipientError);
    return jsonResponse({ skipped: true, reason: 'recipient_not_found' });
  }

  if (!recipient.expo_push_token) {
    return jsonResponse({ skipped: true, reason: 'no_push_token' });
  }

  // Get sender's display name
  const { data: sender } = await supabaseAdmin
    .from('users')
    .select('display_name')
    .eq('id', message.sender_id)
    .single();

  const senderName = sender?.display_name ?? 'Someone';

  // Format the notification
  const notification = formatNotificationBody(
    senderName,
    message.type,
    message.body,
  );

  const ticket = await sendExpoPush(
    recipient.expo_push_token,
    notification.title,
    notification.body,
    'default',
    {
      conversation_id: message.conversation_id,
      message_id: message.id,
      message_type: message.type,
    },
  );

  return jsonResponse({ sent: true, ticket });
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return handleCors();

  try {
    if (req.method !== 'POST') {
      return errorResponse('Method not allowed', 405);
    }

    const payload = (await req.json()) as Payload;

    // Route based on payload type
    if (payload.type === 'direct') {
      return await handleDirectInvocation(payload as DirectInvocationPayload);
    }

    // Webhook path: validate webhook payload shape
    const webhookPayload = payload as WebhookPayload;
    if (!webhookPayload?.record || webhookPayload.type !== 'INSERT' || webhookPayload.table !== 'messages') {
      return errorResponse('Invalid webhook payload', 400);
    }

    return await handleWebhookInvocation(webhookPayload);
  } catch (err) {
    console.error('send-push-notification error:', err);
    const message =
      err instanceof Error ? err.message : 'Internal server error';
    return errorResponse(message, 500);
  }
});
