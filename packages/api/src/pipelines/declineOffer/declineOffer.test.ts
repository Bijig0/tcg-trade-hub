import { describe, it, expect, vi } from 'vitest';
import {
  DeclineOfferInputSchema,
  checkListingOwnership,
  checkOfferActionable,
} from './declineOffer';
import declineOffer from './declineOffer';
import type { PipelineContext } from '../definePipeline/definePipeline';

const UUID_A = '550e8400-e29b-41d4-a716-446655440000';
const UUID_B = '550e8400-e29b-41d4-a716-446655440001';
const USER_ID = '550e8400-e29b-41d4-a716-446655440099';

const mockFrom = (selectResult: { data: unknown; error: unknown }) => {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {};
  chain.select = vi.fn().mockReturnValue(chain);
  chain.eq = vi.fn().mockReturnValue(chain);
  chain.single = vi.fn().mockResolvedValue(selectResult);
  return chain;
};

const makeCtx = (fromResult: { data: unknown; error: unknown }): PipelineContext => ({
  supabase: {
    from: vi.fn().mockReturnValue(mockFrom(fromResult)),
  } as unknown as PipelineContext['supabase'],
  userId: USER_ID,
});

describe('DeclineOfferInputSchema', () => {
  it('validates correct input', () => {
    expect(DeclineOfferInputSchema.safeParse({ offerId: UUID_A, listingId: UUID_B }).success).toBe(true);
  });

  it('rejects invalid UUIDs', () => {
    expect(DeclineOfferInputSchema.safeParse({ offerId: 'bad', listingId: UUID_B }).success).toBe(false);
  });
});

describe('checkListingOwnership', () => {
  it('throws when listing not found', async () => {
    const ctx = makeCtx({ data: null, error: { message: 'not found' } });
    await expect(checkListingOwnership.run({ offerId: UUID_A, listingId: UUID_B }, ctx))
      .rejects.toThrow('Listing not found');
  });

  it('throws when user is not listing owner', async () => {
    const ctx = makeCtx({ data: { user_id: 'other' }, error: null });
    await expect(checkListingOwnership.run({ offerId: UUID_A, listingId: UUID_B }, ctx))
      .rejects.toThrow('Only the listing owner can decline offers');
  });
});

describe('checkOfferActionable', () => {
  it('throws when offer is already declined', async () => {
    const ctx = makeCtx({ data: { id: UUID_A, listing_id: UUID_B, status: 'declined' }, error: null });
    await expect(checkOfferActionable.run({ offerId: UUID_A, listingId: UUID_B }, ctx))
      .rejects.toThrow(/Invalid offer status transition/);
  });

  it('passes when offer is pending', async () => {
    const ctx = makeCtx({ data: { id: UUID_A, listing_id: UUID_B, status: 'pending' }, error: null });
    await expect(checkOfferActionable.run({ offerId: UUID_A, listingId: UUID_B }, ctx))
      .resolves.toBeUndefined();
  });
});

describe('declineOffer pipeline', () => {
  it('has correct metadata', () => {
    expect(declineOffer.name).toBe('declineOffer');
    expect(declineOffer.rpc.functionName).toBe('decline_offer_v1');
    expect(declineOffer.preChecks).toHaveLength(2);
  });

  it('maps params correctly', () => {
    const params = declineOffer.rpc.mapParams(
      { offerId: UUID_A, listingId: UUID_B },
      { supabase: {} as PipelineContext['supabase'], userId: USER_ID },
    );
    expect(params).toEqual({ p_offer_id: UUID_A, p_user_id: USER_ID });
  });
});
