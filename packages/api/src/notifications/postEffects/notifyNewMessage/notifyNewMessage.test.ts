import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { PipelineContext } from '../../../pipelines/definePipeline/definePipeline';
import { notifyNewMessage } from './notifyNewMessage';

const USER_ID = '550e8400-e29b-41d4-a716-446655440001';
const RECIPIENT_ID = '550e8400-e29b-41d4-a716-446655440002';

const mockInvoke = vi.fn().mockResolvedValue({ data: null, error: null });

const makeMockSb = (senderName: string | null) => {
  const fromMock = vi.fn().mockImplementation((_table: string) => {
    const chain: Record<string, ReturnType<typeof vi.fn>> = {};
    chain.select = vi.fn().mockReturnValue(chain);
    chain.eq = vi.fn().mockReturnValue(chain);
    chain.single = vi.fn().mockResolvedValue({
      data: senderName ? { display_name: senderName } : null,
      error: senderName ? null : { message: 'not found' },
    });
    return chain;
  });

  return {
    from: fromMock,
    functions: { invoke: mockInvoke },
  } as unknown as PipelineContext['supabase'];
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('notifyNewMessage', () => {
  it('sends text message notification', async () => {
    const sb = makeMockSb('Dave');
    const ctx: PipelineContext = { supabase: sb, userId: USER_ID, adminSupabase: sb };

    await notifyNewMessage.run(
      { type: 'text', body: 'Hey, want to trade?' },
      { recipient_id: RECIPIENT_ID },
      ctx,
    );

    expect(mockInvoke).toHaveBeenCalledOnce();
    expect(mockInvoke).toHaveBeenCalledWith('send-push-notification', {
      body: {
        type: 'direct',
        recipientUserId: RECIPIENT_ID,
        title: 'Dave',
        body: 'Hey, want to trade?',
        data: { type: 'text' },
      },
    });
  });

  it('sends card_offer message notification', async () => {
    const sb = makeMockSb('Eve');
    const ctx: PipelineContext = { supabase: sb, userId: USER_ID, adminSupabase: sb };

    await notifyNewMessage.run(
      { type: 'card_offer', body: null },
      { recipient_id: RECIPIENT_ID },
      ctx,
    );

    expect(mockInvoke).toHaveBeenCalledWith('send-push-notification', {
      body: {
        type: 'direct',
        recipientUserId: RECIPIENT_ID,
        title: 'Eve - Trade Offer',
        body: 'Sent you a card trade offer',
        data: { type: 'card_offer' },
      },
    });
  });

  it('sends image message notification', async () => {
    const sb = makeMockSb('Frank');
    const ctx: PipelineContext = { supabase: sb, userId: USER_ID, adminSupabase: sb };

    await notifyNewMessage.run(
      { type: 'image', body: null },
      { recipient_id: RECIPIENT_ID },
      ctx,
    );

    expect(mockInvoke).toHaveBeenCalledWith('send-push-notification', {
      body: expect.objectContaining({
        title: 'Frank',
        body: 'Sent an image',
      }),
    });
  });

  it('sends meetup_proposal message notification', async () => {
    const sb = makeMockSb('Grace');
    const ctx: PipelineContext = { supabase: sb, userId: USER_ID, adminSupabase: sb };

    await notifyNewMessage.run(
      { type: 'meetup_proposal', body: null },
      { recipient_id: RECIPIENT_ID },
      ctx,
    );

    expect(mockInvoke).toHaveBeenCalledWith('send-push-notification', {
      body: expect.objectContaining({
        title: 'Grace - Meetup Proposal',
        body: 'Proposed a meetup location and time',
      }),
    });
  });

  it('skips system messages', async () => {
    const sb = makeMockSb('System');
    const ctx: PipelineContext = { supabase: sb, userId: USER_ID, adminSupabase: sb };

    await notifyNewMessage.run(
      { type: 'system', body: 'Maintenance notice' },
      { recipient_id: RECIPIENT_ID },
      ctx,
    );

    expect(mockInvoke).not.toHaveBeenCalled();
  });

  it('uses fallback sender name when profile not found', async () => {
    const sb = makeMockSb(null);
    const ctx: PipelineContext = { supabase: sb, userId: USER_ID, adminSupabase: sb };

    await notifyNewMessage.run(
      { type: 'text', body: 'Hello' },
      { recipient_id: RECIPIENT_ID },
      ctx,
    );

    expect(mockInvoke).toHaveBeenCalledWith('send-push-notification', {
      body: expect.objectContaining({
        title: 'Someone',
        body: 'Hello',
      }),
    });
  });
});
