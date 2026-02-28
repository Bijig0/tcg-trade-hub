import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { PipelineContext } from '../../../pipelines/definePipeline/definePipeline';
import notifyOfferCreated from './notifyOfferCreated';

const USER_ID = '550e8400-e29b-41d4-a716-446655440001';
const LISTING_OWNER_ID = '550e8400-e29b-41d4-a716-446655440002';
const OFFER_ID = '550e8400-e29b-41d4-a716-446655440003';
const LISTING_ID = '550e8400-e29b-41d4-a716-446655440004';

const mockInvoke = vi.fn().mockResolvedValue({ data: null, error: null });

const makeMockSb = (listingUserId: string | null, senderName: string | null) => {
  const fromMock = vi.fn().mockImplementation((table: string) => {
    const chain: Record<string, ReturnType<typeof vi.fn>> = {};
    chain.select = vi.fn().mockReturnValue(chain);
    chain.eq = vi.fn().mockReturnValue(chain);

    if (table === 'listings') {
      chain.single = vi.fn().mockResolvedValue({
        data: listingUserId ? { user_id: listingUserId } : null,
        error: listingUserId ? null : { message: 'not found' },
      });
    } else if (table === 'profiles') {
      chain.single = vi.fn().mockResolvedValue({
        data: senderName ? { display_name: senderName } : null,
        error: senderName ? null : { message: 'not found' },
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

describe('notifyOfferCreated', () => {
  it('sends notification to listing owner', async () => {
    const sb = makeMockSb(LISTING_OWNER_ID, 'Alice');
    const ctx: PipelineContext = { supabase: sb, userId: USER_ID, adminSupabase: sb };

    await notifyOfferCreated.run(
      { listingId: LISTING_ID },
      { offer_id: OFFER_ID },
      ctx,
    );

    expect(mockInvoke).toHaveBeenCalledOnce();
    expect(mockInvoke).toHaveBeenCalledWith('send-push-notification', {
      body: {
        type: 'direct',
        recipientUserId: LISTING_OWNER_ID,
        title: 'Alice - Trade Offer',
        body: 'Sent you a trade offer',
        data: { offerId: OFFER_ID },
      },
    });
  });

  it('skips notification when sender is listing owner', async () => {
    const sb = makeMockSb(USER_ID, 'Self');
    const ctx: PipelineContext = { supabase: sb, userId: USER_ID, adminSupabase: sb };

    await notifyOfferCreated.run(
      { listingId: LISTING_ID },
      { offer_id: OFFER_ID },
      ctx,
    );

    expect(mockInvoke).not.toHaveBeenCalled();
  });

  it('skips notification when listing not found', async () => {
    const sb = makeMockSb(null, null);
    const ctx: PipelineContext = { supabase: sb, userId: USER_ID, adminSupabase: sb };

    await notifyOfferCreated.run(
      { listingId: LISTING_ID },
      { offer_id: OFFER_ID },
      ctx,
    );

    expect(mockInvoke).not.toHaveBeenCalled();
  });

  it('uses fallback sender name when profile not found', async () => {
    const sb = makeMockSb(LISTING_OWNER_ID, null);
    const ctx: PipelineContext = { supabase: sb, userId: USER_ID, adminSupabase: sb };

    await notifyOfferCreated.run(
      { listingId: LISTING_ID },
      { offer_id: OFFER_ID },
      ctx,
    );

    expect(mockInvoke).toHaveBeenCalledWith('send-push-notification', {
      body: expect.objectContaining({
        title: 'Someone - Trade Offer',
      }),
    });
  });
});
