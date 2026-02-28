import { z } from 'zod';
import definePipeline from '../definePipeline/definePipeline';
import { notifyNewMessage } from '../../notifications/postEffects/notifyNewMessage/notifyNewMessage';

const SendMessageInputSchema = z.object({
  conversationId: z.string().uuid(),
  type: z.string(),
  body: z.string().nullable().optional(),
  payload: z.string().nullable().optional(),
});

type SendMessageInput = z.infer<typeof SendMessageInputSchema>;

const SendMessageResultSchema = z.object({
  message_id: z.string().uuid(),
  conversation_id: z.string().uuid(),
  sender_id: z.string().uuid(),
  recipient_id: z.string().uuid(),
});

type SendMessageResult = z.infer<typeof SendMessageResultSchema>;

/**
 * Sends a message in an existing conversation via an atomic RPC call.
 * Validates input, inserts the message, and fires a push notification post-effect.
 */
const sendMessage = definePipeline({
  name: 'sendMessage',
  description:
    'Sends a message in an existing conversation. Inserts the message row atomically ' +
    'and fires a push notification to the recipient.',

  inputSchema: SendMessageInputSchema,

  preChecks: [],

  rpc: {
    functionName: 'send_message_v1',
    mapParams: (input, ctx) => ({
      p_conversation_id: input.conversationId,
      p_sender_id: ctx.userId,
      p_type: input.type,
      p_body: input.body ?? null,
      p_payload: input.payload ?? null,
    }),
    resultSchema: SendMessageResultSchema,
  },

  postEffects: [notifyNewMessage],
});

export default sendMessage;
export { SendMessageInputSchema, SendMessageResultSchema };
export type { SendMessageInput, SendMessageResult };
