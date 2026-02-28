import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { PipelineContext } from '../../../pipelines/definePipeline/definePipeline';
import { notifyMeetupCompleted } from './notifyMeetupCompleted';

const USER_A_ID = '550e8400-e29b-41d4-a716-446655440001';
const USER_B_ID = '550e8400-e29b-41d4-a716-446655440002';
const MEETUP_ID = '550e8400-e29b-41d4-a716-446655440003';
const MATCH_ID = '550e8400-e29b-41d4-a716-446655440004';

const mockInvoke = vi.fn().mockResolvedValue({ data: null, error: null });

type MockLookups = {
  meetupMatchId: string | null;
  matchUsers: { user_a_id: string; user_b_id: string } | null;
  senderName: string | null;
};

const makeMockSb = (lookups: MockLookups) => {
  const fromMock = vi.fn().mockImplementation((table: string) => {
    const chain: Record<string, ReturnType<typeof vi.fn>> = {};
    chain.select = vi.fn().mockReturnValue(chain);
    chain.eq = vi.fn().mockReturnValue(chain);

    if (table === 'meetups') {
      chain.single = vi.fn().mockResolvedValue({
        data: lookups.meetupMatchId ? { match_id: lookups.meetupMatchId } : null,
        error: lookups.meetupMatchId ? null : { message: 'not found' },
      });
    } else if (table === 'matches') {
      chain.single = vi.fn().mockResolvedValue({
        data: lookups.matchUsers,
        error: lookups.matchUsers ? null : { message: 'not found' },
      });
    } else if (table === 'profiles') {
      chain.single = vi.fn().mockResolvedValue({
        data: lookups.senderName ? { display_name: lookups.senderName } : null,
        error: lookups.senderName ? null : { message: 'not found' },
      });
    }

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

describe('notifyMeetupCompleted', () => {
  it('sends notification to other participant when user_a completes', async () => {
    const sb = makeMockSb({
      meetupMatchId: MATCH_ID,
      matchUsers: { user_a_id: USER_A_ID, user_b_id: USER_B_ID },
      senderName: 'Alice',
    });
    const ctx: PipelineContext = { supabase: sb, userId: USER_A_ID, adminSupabase: sb };

    await notifyMeetupCompleted.run(
      { meetupId: MEETUP_ID },
      { meetup_id: MEETUP_ID, both_completed: false },
      ctx,
    );

    expect(mockInvoke).toHaveBeenCalledOnce();
    expect(mockInvoke).toHaveBeenCalledWith('send-push-notification', {
      body: {
        type: 'direct',
        recipientUserId: USER_B_ID,
        title: 'Alice - Meetup',
        body: 'Marked the meetup as complete',
        data: { meetupId: MEETUP_ID },
      },
    });
  });

  it('sends notification to other participant when user_b completes', async () => {
    const sb = makeMockSb({
      meetupMatchId: MATCH_ID,
      matchUsers: { user_a_id: USER_A_ID, user_b_id: USER_B_ID },
      senderName: 'Bob',
    });
    const ctx: PipelineContext = { supabase: sb, userId: USER_B_ID, adminSupabase: sb };

    await notifyMeetupCompleted.run(
      { meetupId: MEETUP_ID },
      { meetup_id: MEETUP_ID, both_completed: false },
      ctx,
    );

    expect(mockInvoke).toHaveBeenCalledWith('send-push-notification', {
      body: expect.objectContaining({
        recipientUserId: USER_A_ID,
      }),
    });
  });

  it('skips notification when both_completed is true', async () => {
    const sb = makeMockSb({
      meetupMatchId: MATCH_ID,
      matchUsers: { user_a_id: USER_A_ID, user_b_id: USER_B_ID },
      senderName: 'Alice',
    });
    const ctx: PipelineContext = { supabase: sb, userId: USER_A_ID, adminSupabase: sb };

    await notifyMeetupCompleted.run(
      { meetupId: MEETUP_ID },
      { meetup_id: MEETUP_ID, both_completed: true },
      ctx,
    );

    expect(mockInvoke).not.toHaveBeenCalled();
  });

  it('skips notification when meetup not found', async () => {
    const sb = makeMockSb({
      meetupMatchId: null,
      matchUsers: null,
      senderName: null,
    });
    const ctx: PipelineContext = { supabase: sb, userId: USER_A_ID, adminSupabase: sb };

    await notifyMeetupCompleted.run(
      { meetupId: MEETUP_ID },
      { meetup_id: MEETUP_ID, both_completed: false },
      ctx,
    );

    expect(mockInvoke).not.toHaveBeenCalled();
  });

  it('skips notification when match not found', async () => {
    const sb = makeMockSb({
      meetupMatchId: MATCH_ID,
      matchUsers: null,
      senderName: null,
    });
    const ctx: PipelineContext = { supabase: sb, userId: USER_A_ID, adminSupabase: sb };

    await notifyMeetupCompleted.run(
      { meetupId: MEETUP_ID },
      { meetup_id: MEETUP_ID, both_completed: false },
      ctx,
    );

    expect(mockInvoke).not.toHaveBeenCalled();
  });

  it('uses fallback sender name when profile not found', async () => {
    const sb = makeMockSb({
      meetupMatchId: MATCH_ID,
      matchUsers: { user_a_id: USER_A_ID, user_b_id: USER_B_ID },
      senderName: null,
    });
    const ctx: PipelineContext = { supabase: sb, userId: USER_A_ID, adminSupabase: sb };

    await notifyMeetupCompleted.run(
      { meetupId: MEETUP_ID },
      { meetup_id: MEETUP_ID, both_completed: false },
      ctx,
    );

    expect(mockInvoke).toHaveBeenCalledWith('send-push-notification', {
      body: expect.objectContaining({
        title: 'Someone - Meetup',
      }),
    });
  });
});
