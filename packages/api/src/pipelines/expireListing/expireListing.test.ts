import { describe, it, expect, vi } from 'vitest';
import {
  ExpireListingInputSchema,
  checkListingOwnership,
} from './expireListing';
import expireListing from './expireListing';
import type { PipelineContext } from '../definePipeline/definePipeline';

const UUID_A = '550e8400-e29b-41d4-a716-446655440000';
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

describe('ExpireListingInputSchema', () => {
  it('validates correct input', () => {
    expect(ExpireListingInputSchema.safeParse({ listingId: UUID_A }).success).toBe(true);
  });

  it('rejects non-UUID', () => {
    expect(ExpireListingInputSchema.safeParse({ listingId: 'bad' }).success).toBe(false);
  });
});

describe('checkListingOwnership', () => {
  it('throws when listing not found', async () => {
    const ctx = makeCtx({ data: null, error: { message: 'not found' } });
    await expect(checkListingOwnership.run({ listingId: UUID_A }, ctx))
      .rejects.toThrow('Listing not found');
  });

  it('throws when user is not listing owner', async () => {
    const ctx = makeCtx({ data: { user_id: 'other', status: 'active' }, error: null });
    await expect(checkListingOwnership.run({ listingId: UUID_A }, ctx))
      .rejects.toThrow('Only the listing owner can expire a listing');
  });

  it('throws when listing cannot transition to expired', async () => {
    const ctx = makeCtx({ data: { user_id: USER_ID, status: 'completed' }, error: null });
    await expect(checkListingOwnership.run({ listingId: UUID_A }, ctx))
      .rejects.toThrow(/Invalid listing status transition/);
  });

  it('passes when user owns listing and status is active', async () => {
    const ctx = makeCtx({ data: { user_id: USER_ID, status: 'active' }, error: null });
    await expect(checkListingOwnership.run({ listingId: UUID_A }, ctx))
      .resolves.toBeUndefined();
  });
});

describe('expireListing pipeline', () => {
  it('has correct metadata', () => {
    expect(expireListing.name).toBe('expireListing');
    expect(expireListing.rpc.functionName).toBe('expire_listing_v1');
    expect(expireListing.preChecks).toHaveLength(1);
  });

  it('maps params correctly', () => {
    const params = expireListing.rpc.mapParams(
      { listingId: UUID_A },
      { supabase: {} as PipelineContext['supabase'], userId: USER_ID },
    );
    expect(params).toEqual({ p_listing_id: UUID_A, p_user_id: USER_ID });
  });
});
