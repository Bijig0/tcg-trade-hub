import { z } from 'zod';

export const SendTextMessageSchema = z.object({
  body: z.string().min(1, 'Message cannot be empty'),
});

export type SendTextMessage = z.infer<typeof SendTextMessageSchema>;

export const SendImageMessageSchema = z.object({
  url: z.string().url('Must be a valid URL'),
});

export type SendImageMessage = z.infer<typeof SendImageMessageSchema>;
