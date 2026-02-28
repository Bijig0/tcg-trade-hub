import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { PipelineContext } from '../../../pipelines/definePipeline/definePipeline';
import notifyOfferDeclined from './notifyOfferDeclined';

const USER_ID = '550e8400-e29b-41d4-a716-446655440001';
const OFFERER_ID = '550e8400-e29b-41d4-a716-446655440002';
const OFFER_ID = '550e8400-e29b-41d4-a716-446655440003';
const LISTING_ID = '550e8400-e29b-41d4-a716-446655440004';

const mockInvoke = vi.fn().mockResolvedValue({ data: null, error: null });

const makeMockSb = (offererId: string | null, senderName: string | null) => {
  const fromMock = vi.fn().mockImplementation((table: string) => {
    const chain: Record<string, ReturnType<typeof vi.fn>> = {};
    chain.select = vi.fn().mockReturnValue(chain);
    chain.eq = vi.fn().mockReturnValue(chain);

    if (table === 'offers') {
      chain.single = vi.fn().mockResolvedValue({
        data: offererId ? { offerer_id: offererId } : null,
        error: offererId ? null : { message: 'not found' },
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

describe('notifyOfferDeclined', () => {
  it('sends notification to offerer', async () => {
    const sb = makeMockSb(OFFERER_ID, 'Carol');
    const ctx: PipelineContext = { supabase: sb, userId: USER_ID, adminSupabase: sb };

    await notifyOfferDeclined.run(
      { offerId: OFFER_ID, listingId: LISTING_ID },
      { success: true },
      ctx,
    );

    expect(mockInvoke).toHaveBeenCalledOnce();
    expect(mockInvoke).toHaveBeenCalledWith('send-push-notification', {
      body: {
        type: 'direct',
        recipientUserId: OFFERER_ID,
        title: 'Carol - Trade Offer',
        body: 'Declined your trade offer',
        data: { offerId: OFFER_ID },
      },
    });
  });

  it('skips notification when offer not found', async () => {
    const sb = makeMockSb(null, null);
    const ctx: PipelineContext = { supabase: sb, userId: USER_ID, adminSupabase: sb };

    await notifyOfferDeclined.run(
      { offerId: OFFER_ID, listingId: LISTING_ID },
      { success: true },
      ctx,
    );

    expect(mockInvoke).not.toHaveBeenCalled();
  });

  it('uses fallback sender name when profile not found', async () => {
    const sb = makeMockSb(OFFERER_ID, null);
    const ctx: PipelineContext = { supabase: sb, userId: USER_ID, adminSupabase: sb };

    await notifyOfferDeclined.run(
      { offerId: OFFER_ID, listingId: LISTING_ID },
      { success: true },
      ctx,
    );

    expect(mockInvoke).toHaveBeenCalledWith('send-push-notification', {
      body: expect.objectContaining({
        title: 'Someone - Trade Offer',
      }),
    });
  });
});
