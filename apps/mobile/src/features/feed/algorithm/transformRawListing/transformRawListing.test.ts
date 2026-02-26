import { describe, it, expect } from 'vitest';
import transformRawListing from './transformRawListing';
import type { RawFeedListing } from './transformRawListing';

const makeRaw = (overrides: Partial<RawFeedListing> = {}): RawFeedListing => ({
  id: 'listing-1',
  user_id: 'user-1',
  type: 'wts',
  tcg: 'pokemon',
  title: 'Charizard Bundle',
  cash_amount: 50,
  total_value: 120,
  description: 'Mint condition cards',
  photos: ['https://example.com/photo1.jpg'],
  status: 'active',
  created_at: '2026-01-15T10:00:00Z',
  updated_at: '2026-01-15T10:00:00Z',
  listing_items: [
    {
      id: 'item-1',
      listing_id: 'listing-1',
      card_name: 'Charizard VMAX',
      card_image_url: 'https://example.com/charizard.jpg',
      card_external_id: 'sv3-123',
      tcg: 'pokemon',
      card_set: 'Obsidian Flames',
      card_number: '123',
      condition: 'near_mint',
      market_price: 45,
      card_rarity: 'Ultra Rare',
      quantity: 1,
    },
  ],
  users: {
    id: 'user-1',
    display_name: 'TrainerAsh',
    avatar_url: 'https://example.com/avatar.jpg',
    location: null,
    rating_score: 4.8,
    total_trades: 15,
  },
  ...overrides,
});

describe('transformRawListing', () => {
  it('should transform a raw listing to ListingWithDistance shape', () => {
    const result = transformRawListing(makeRaw());

    expect(result.id).toBe('listing-1');
    expect(result.user_id).toBe('user-1');
    expect(result.type).toBe('wts');
    expect(result.tcg).toBe('pokemon');
    expect(result.title).toBe('Charizard Bundle');
    expect(result.cash_amount).toBe(50);
    expect(result.total_value).toBe(120);
    expect(result.description).toBe('Mint condition cards');
    expect(result.photos).toEqual(['https://example.com/photo1.jpg']);
    expect(result.status).toBe('active');
    expect(result.distance_km).toBe(0);
    expect(result.offer_count).toBe(0);
  });

  it('should extract owner profile correctly', () => {
    const result = transformRawListing(makeRaw());

    expect(result.owner).toEqual({
      display_name: 'TrainerAsh',
      avatar_url: 'https://example.com/avatar.jpg',
      rating_score: 4.8,
      total_trades: 15,
    });
  });

  it('should default rating_score and total_trades to 0 when null', () => {
    const result = transformRawListing(
      makeRaw({
        users: {
          id: 'user-1',
          display_name: 'NewUser',
          avatar_url: null,
          location: null,
          rating_score: null,
          total_trades: null,
        },
      }),
    );

    expect(result.owner.rating_score).toBe(0);
    expect(result.owner.total_trades).toBe(0);
    expect(result.owner.avatar_url).toBeNull();
  });

  it('should handle null listing_items', () => {
    const result = transformRawListing(makeRaw({ listing_items: null }));
    expect(result.items).toEqual([]);
  });

  it('should handle null description', () => {
    const result = transformRawListing(makeRaw({ description: null }));
    expect(result.description).toBeNull();
  });

  it('should preserve listing_items as items array', () => {
    const result = transformRawListing(makeRaw());
    expect(result.items).toHaveLength(1);
    expect((result.items[0] as Record<string, unknown>).card_name).toBe('Charizard VMAX');
  });
});
