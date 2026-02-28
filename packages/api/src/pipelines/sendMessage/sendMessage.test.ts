import { describe, it, expect, vi } from 'vitest';
import { SendMessageInputSchema } from './sendMessage';
import sendMessage from './sendMessage';
import type { PipelineContext } from '../definePipeline/definePipeline';

const UUID_CONV = '550e8400-e29b-41d4-a716-446655440000';
const USER_ID = '550e8400-e29b-41d4-a716-446655440099';

const validInput = {
  conversationId: UUID_CONV,
  type: 'text',
  body: 'Hello!',
  payload: null,
};

describe('SendMessageInputSchema', () => {
  it('validates correct input', () => {
    expect(SendMessageInputSchema.safeParse(validInput).success).toBe(true);
  });

  it('validates input with optional fields omitted', () => {
    const minimal = { conversationId: UUID_CONV, type: 'text' };
    expect(SendMessageInputSchema.safeParse(minimal).success).toBe(true);
  });

  it('validates input with null body and payload', () => {
    const nullFields = { ...validInput, body: null, payload: null };
    expect(SendMessageInputSchema.safeParse(nullFields).success).toBe(true);
  });

  it('rejects invalid conversationId', () => {
    const bad = { ...validInput, conversationId: 'not-a-uuid' };
    expect(SendMessageInputSchema.safeParse(bad).success).toBe(false);
  });

  it('rejects missing conversationId', () => {
    const { conversationId: _, ...rest } = validInput;
    expect(SendMessageInputSchema.safeParse(rest).success).toBe(false);
  });

  it('rejects missing type', () => {
    const { type: _, ...rest } = validInput;
    expect(SendMessageInputSchema.safeParse(rest).success).toBe(false);
  });
});

describe('sendMessage pipeline', () => {
  it('has correct metadata', () => {
    expect(sendMessage.name).toBe('sendMessage');
    expect(sendMessage.rpc.functionName).toBe('send_message_v1');
    expect(sendMessage.preChecks).toHaveLength(0);
    expect(sendMessage.postEffects).toHaveLength(1);
    expect(sendMessage.postEffects[0].name).toBe('notifyNewMessage');
  });

  it('maps params correctly', () => {
    const params = sendMessage.rpc.mapParams(
      validInput,
      { supabase: {} as PipelineContext['supabase'], userId: USER_ID },
    );
    expect(params).toEqual({
      p_conversation_id: UUID_CONV,
      p_sender_id: USER_ID,
      p_type: 'text',
      p_body: 'Hello!',
      p_payload: null,
    });
  });

  it('maps params with undefined body/payload to null', () => {
    const input = { conversationId: UUID_CONV, type: 'text' };
    const params = sendMessage.rpc.mapParams(
      input,
      { supabase: {} as PipelineContext['supabase'], userId: USER_ID },
    );
    expect(params.p_body).toBeNull();
    expect(params.p_payload).toBeNull();
  });

  it('execute throws when RPC fails', async () => {
    const ctx: PipelineContext = {
      supabase: {
        rpc: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'conversation not found' },
        }),
      } as unknown as PipelineContext['supabase'],
      userId: USER_ID,
    };

    await expect(sendMessage.execute(validInput, ctx)).rejects.toThrow(
      'Pipeline "sendMessage" RPC failed: conversation not found',
    );
  });

  it('execute succeeds and fires post-effect', async () => {
    const rpcResult = {
      message_id: '550e8400-e29b-41d4-a716-446655440001',
      conversation_id: UUID_CONV,
      sender_id: USER_ID,
      recipient_id: '550e8400-e29b-41d4-a716-446655440077',
    };

    const mockInvoke = vi.fn().mockResolvedValue({ data: null, error: null });
    const mockFrom = vi.fn().mockImplementation((_table: string) => {
      const chain: Record<string, ReturnType<typeof vi.fn>> = {};
      chain.select = vi.fn().mockReturnValue(chain);
      chain.eq = vi.fn().mockReturnValue(chain);
      chain.single = vi.fn().mockResolvedValue({
        data: { display_name: 'TestUser' },
        error: null,
      });
      return chain;
    });

    const ctx: PipelineContext = {
      supabase: {
        rpc: vi.fn().mockResolvedValue({ data: rpcResult, error: null }),
        from: mockFrom,
        functions: {
          invoke: mockInvoke,
        },
      } as unknown as PipelineContext['supabase'],
      userId: USER_ID,
    };

    const result = await sendMessage.execute(validInput, ctx);
    expect(result).toEqual(rpcResult);
    expect(mockInvoke).toHaveBeenCalledWith(
      'send-push-notification',
      {
        body: {
          type: 'direct',
          recipientUserId: rpcResult.recipient_id,
          title: 'TestUser',
          body: 'Hello!',
          data: { type: 'text' },
        },
      },
    );
  });

  it('execute succeeds even if post-effect fails', async () => {
    const rpcResult = {
      message_id: '550e8400-e29b-41d4-a716-446655440001',
      conversation_id: UUID_CONV,
      sender_id: USER_ID,
      recipient_id: '550e8400-e29b-41d4-a716-446655440077',
    };

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const mockFrom = vi.fn().mockImplementation(() => {
      throw new Error('db connection failed');
    });

    const ctx: PipelineContext = {
      supabase: {
        rpc: vi.fn().mockResolvedValue({ data: rpcResult, error: null }),
        from: mockFrom,
        functions: {
          invoke: vi.fn().mockRejectedValue(new Error('push failed')),
        },
      } as unknown as PipelineContext['supabase'],
      userId: USER_ID,
    };

    const result = await sendMessage.execute(validInput, ctx);
    expect(result).toEqual(rpcResult);
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('post-effect "notifyNewMessage" failed'),
      expect.any(Error),
    );
    consoleSpy.mockRestore();
  });
});
