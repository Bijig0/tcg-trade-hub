import { describe, it, expect, vi } from 'vitest';
import {
  CompleteMeetupInputSchema,
  checkMeetupParticipant,
} from './completeMeetup';
import completeMeetup from './completeMeetup';
import type { PipelineContext } from '../definePipeline/definePipeline';

const UUID_A = '550e8400-e29b-41d4-a716-446655440000';
const USER_ID = '550e8400-e29b-41d4-a716-446655440099';
const OTHER_USER = '550e8400-e29b-41d4-a716-446655440088';

type MockResult = { data: unknown; error: unknown };

const makeCtx = (meetupResult: MockResult, matchResult?: MockResult): PipelineContext => {
  let callCount = 0;
  const makeMockChain = (result: MockResult) => {
    const chain: Record<string, ReturnType<typeof vi.fn>> = {};
    chain.select = vi.fn().mockReturnValue(chain);
    chain.eq = vi.fn().mockReturnValue(chain);
    chain.single = vi.fn().mockResolvedValue(result);
    return chain;
  };

  return {
    supabase: {
      from: vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) return makeMockChain(meetupResult);
        return makeMockChain(matchResult ?? { data: null, error: null });
      }),
    } as unknown as PipelineContext['supabase'],
    userId: USER_ID,
  };
};

describe('CompleteMeetupInputSchema', () => {
  it('validates correct input', () => {
    expect(CompleteMeetupInputSchema.safeParse({ meetupId: UUID_A }).success).toBe(true);
  });

  it('rejects non-UUID', () => {
    expect(CompleteMeetupInputSchema.safeParse({ meetupId: 'bad' }).success).toBe(false);
  });
});

describe('checkMeetupParticipant', () => {
  it('throws when meetup not found', async () => {
    const ctx = makeCtx({ data: null, error: { message: 'not found' } });
    await expect(checkMeetupParticipant.run({ meetupId: UUID_A }, ctx))
      .rejects.toThrow('Meetup not found');
  });

  it('throws when meetup is not confirmed', async () => {
    const ctx = makeCtx(
      { data: { id: UUID_A, status: 'completed', match_id: 'x' }, error: null },
    );
    await expect(checkMeetupParticipant.run({ meetupId: UUID_A }, ctx))
      .rejects.toThrow('Meetup is not in confirmed state');
  });

  it('throws when user is not a participant', async () => {
    const ctx = makeCtx(
      { data: { id: UUID_A, status: 'confirmed', match_id: 'match-1' }, error: null },
      { data: { user_a_id: OTHER_USER, user_b_id: 'another-user' }, error: null },
    );
    await expect(checkMeetupParticipant.run({ meetupId: UUID_A }, ctx))
      .rejects.toThrow('Not a participant in this meetup');
  });

  it('passes when user is user_a', async () => {
    const ctx = makeCtx(
      { data: { id: UUID_A, status: 'confirmed', match_id: 'match-1' }, error: null },
      { data: { user_a_id: USER_ID, user_b_id: OTHER_USER }, error: null },
    );
    await expect(checkMeetupParticipant.run({ meetupId: UUID_A }, ctx))
      .resolves.toBeUndefined();
  });

  it('passes when user is user_b', async () => {
    const ctx = makeCtx(
      { data: { id: UUID_A, status: 'confirmed', match_id: 'match-1' }, error: null },
      { data: { user_a_id: OTHER_USER, user_b_id: USER_ID }, error: null },
    );
    await expect(checkMeetupParticipant.run({ meetupId: UUID_A }, ctx))
      .resolves.toBeUndefined();
  });
});

describe('completeMeetup pipeline', () => {
  it('has correct metadata', () => {
    expect(completeMeetup.name).toBe('completeMeetup');
    expect(completeMeetup.rpc.functionName).toBe('complete_meetup_v1');
    expect(completeMeetup.preChecks).toHaveLength(1);
  });

  it('maps params correctly', () => {
    const params = completeMeetup.rpc.mapParams(
      { meetupId: UUID_A },
      { supabase: {} as PipelineContext['supabase'], userId: USER_ID },
    );
    expect(params).toEqual({ p_meetup_id: UUID_A, p_user_id: USER_ID });
  });
});
