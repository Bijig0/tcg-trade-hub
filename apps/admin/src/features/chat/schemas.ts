import { z } from 'zod';

const messagePartSchema = z.object({
  type: z.string().min(1),
}).passthrough();

const messageSchema = z.object({
  id: z.string().min(1),
  role: z.enum(['user', 'assistant', 'system']),
  parts: z.array(messagePartSchema).min(1),
}).superRefine((message, ctx) => {
  message.parts.forEach((part, index) => {
    if (part.type !== 'text') return;

    const text = (part as { text?: unknown }).text;
    if (typeof text !== 'string') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['parts', index, 'text'],
        message: 'Text part must include text',
      });
      return;
    }

    if (text.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.too_small,
        type: 'string',
        minimum: 1,
        inclusive: true,
        path: ['parts', index, 'text'],
        message: 'Text part cannot be empty',
      });
    }

    if (text.length > 10_000) {
      ctx.addIssue({
        code: z.ZodIssueCode.too_big,
        type: 'string',
        maximum: 10_000,
        inclusive: true,
        path: ['parts', index, 'text'],
        message: 'Text part too long',
      });
    }
  });
});

export const chatRequestSchema = z.object({
  messages: z.array(messageSchema).min(1, 'At least one message is required').max(50),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;
