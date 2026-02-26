import { describe, it, expect, vi } from 'vitest';
import {
  AcceptOfferInputSchema,
  checkListingOwnership,
  checkOfferActionable,
} from './acceptOffer';
import acceptOffer from './acceptOffer';
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
    rpc: vi.fn(),
  } as unknown as PipelineContext['supabase'],
  userId: USER_ID,
});

describe('AcceptOfferInputSchema', () => {
  it('validates correct input', () => {
    const result = AcceptOfferInputSchema.safeParse({ offerId: UUID_A, listingId: UUID_B });
    expect(result.success).toBe(true);
  });

  it('rejects non-UUID offerId', () => {
    const result = AcceptOfferInputSchema.safeParse({ offerId: 'bad', listingId: UUID_B });
    expect(result.success).toBe(false);
  });

  it('rejects missing listingId', () => {
    const result = AcceptOfferInputSchema.safeParse({ offerId: UUID_A });
    expect(result.success).toBe(false);
  });
});

describe('checkListingOwnership', () => {
  it('throws when listing not found', async () => {
    const ctx = makeCtx({ data: null, error: { message: 'not found' } });
    await expect(
      checkListingOwnership.run({ offerId: UUID_A, listingId: UUID_B }, ctx),
    ).rejects.toThrow('Listing not found');
  });

  it('throws when user is not the listing owner', async () => {
    const ctx = makeCtx({ data: { user_id: 'someone-else', status: 'active' }, error: null });
    await expect(
      checkListingOwnership.run({ offerId: UUID_A, listingId: UUID_B }, ctx),
    ).rejects.toThrow('Only the listing owner can accept offers');
  });

  it('throws when listing cannot transition to matched', async () => {
    const ctx = makeCtx({ data: { user_id: USER_ID, status: 'expired' }, error: null });
    await expect(
      checkListingOwnership.run({ offerId: UUID_A, listingId: UUID_B }, ctx),
    ).rejects.toThrow(/Invalid listing status transition/);
  });

  it('passes when user owns listing and status is active', async () => {
    const ctx = makeCtx({ data: { user_id: USER_ID, status: 'active' }, error: null });
    await expect(
      checkListingOwnership.run({ offerId: UUID_A, listingId: UUID_B }, ctx),
    ).resolves.toBeUndefined();
  });
});

describe('checkOfferActionable', () => {
  it('throws when offer not found', async () => {
    const ctx = makeCtx({ data: null, error: { message: 'not found' } });
    await expect(
      checkOfferActionable.run({ offerId: UUID_A, listingId: UUID_B }, ctx),
    ).rejects.toThrow('Offer not found');
  });

  it('throws when offer does not belong to listing', async () => {
    const ctx = makeCtx({
      data: { id: UUID_A, listing_id: 'different-listing', status: 'pending' },
      error: null,
    });
    await expect(
      checkOfferActionable.run({ offerId: UUID_A, listingId: UUID_B }, ctx),
    ).rejects.toThrow('Offer does not belong to this listing');
  });

  it('throws when offer is in terminal status', async () => {
    const ctx = makeCtx({
      data: { id: UUID_A, listing_id: UUID_B, status: 'declined' },
      error: null,
    });
    await expect(
      checkOfferActionable.run({ offerId: UUID_A, listingId: UUID_B }, ctx),
    ).rejects.toThrow(/Invalid offer status transition/);
  });

  it('passes when offer is pending and belongs to listing', async () => {
    const ctx = makeCtx({
      data: { id: UUID_A, listing_id: UUID_B, status: 'pending' },
      error: null,
    });
    await expect(
      checkOfferActionable.run({ offerId: UUID_A, listingId: UUID_B }, ctx),
    ).resolves.toBeUndefined();
  });
});

describe('acceptOffer pipeline', () => {
  it('has correct metadata', () => {
    expect(acceptOffer.name).toBe('acceptOffer');
    expect(acceptOffer.rpc.functionName).toBe('accept_offer_v1');
    expect(acceptOffer.preChecks).toHaveLength(2);
  });

  it('maps params correctly', () => {
    const params = acceptOffer.rpc.mapParams(
      { offerId: UUID_A, listingId: UUID_B },
      { supabase: {} as PipelineContext['supabase'], userId: USER_ID },
    );
    expect(params).toEqual({
      p_offer_id: UUID_A,
      p_listing_id: UUID_B,
      p_user_id: USER_ID,
    });
  });
});
