import { describe, it, expect, vi } from 'vitest';
import {
  CreateOfferInputSchema,
  checkListingActive,
} from './createOffer';
import createOffer from './createOffer';
import type { PipelineContext } from '../definePipeline/definePipeline';

const UUID_A = '550e8400-e29b-41d4-a716-446655440000';
const USER_ID = '550e8400-e29b-41d4-a716-446655440099';
const OWNER_ID = '550e8400-e29b-41d4-a716-446655440077';

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

const validInput = {
  listingId: UUID_A,
  cashAmount: 50,
  message: 'I want this!',
  items: [
    {
      card_name: 'Charizard VMAX',
      card_image_url: 'https://example.com/img.jpg',
      card_external_id: 'sv1-123',
      tcg: 'pokemon',
      card_set: 'Scarlet & Violet',
      card_number: '123',
      condition: 'near_mint',
      market_price: 25.5,
      quantity: 1,
    },
  ],
};

describe('CreateOfferInputSchema', () => {
  it('validates correct input', () => {
    expect(CreateOfferInputSchema.safeParse(validInput).success).toBe(true);
  });

  it('validates input with no items', () => {
    const noItems = { ...validInput, items: [] };
    expect(CreateOfferInputSchema.safeParse(noItems).success).toBe(true);
  });

  it('rejects negative cash amount', () => {
    const bad = { ...validInput, cashAmount: -5 };
    expect(CreateOfferInputSchema.safeParse(bad).success).toBe(false);
  });

  it('rejects missing listingId', () => {
    const { listingId: _, ...rest } = validInput;
    expect(CreateOfferInputSchema.safeParse(rest).success).toBe(false);
  });
});

describe('checkListingActive', () => {
  it('throws when listing not found', async () => {
    const ctx = makeCtx({ data: null, error: { message: 'not found' } });
    await expect(checkListingActive.run(validInput, ctx))
      .rejects.toThrow('Listing not found');
  });

  it('throws when listing is not active', async () => {
    const ctx = makeCtx({ data: { user_id: OWNER_ID, status: 'expired' }, error: null });
    await expect(checkListingActive.run(validInput, ctx))
      .rejects.toThrow('Listing is not active');
  });

  it('throws when user offers on own listing', async () => {
    const ctx = makeCtx({ data: { user_id: USER_ID, status: 'active' }, error: null });
    await expect(checkListingActive.run(validInput, ctx))
      .rejects.toThrow('Cannot offer on your own listing');
  });

  it('passes when listing is active and owned by someone else', async () => {
    const ctx = makeCtx({ data: { user_id: OWNER_ID, status: 'active' }, error: null });
    await expect(checkListingActive.run(validInput, ctx))
      .resolves.toBeUndefined();
  });
});

describe('createOffer pipeline', () => {
  it('has correct metadata', () => {
    expect(createOffer.name).toBe('createOffer');
    expect(createOffer.rpc.functionName).toBe('create_offer_v1');
    expect(createOffer.preChecks).toHaveLength(1);
  });

  it('maps params correctly with stringified items', () => {
    const params = createOffer.rpc.mapParams(
      validInput,
      { supabase: {} as PipelineContext['supabase'], userId: USER_ID },
    );
    expect(params).toEqual({
      p_listing_id: UUID_A,
      p_offerer_id: USER_ID,
      p_cash_amount: 50,
      p_message: 'I want this!',
      p_items: JSON.stringify(validInput.items),
    });
  });
});
