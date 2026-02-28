import { describe, it, expect } from 'vitest';
import rankListings from './rankListings';
import type { ListingRow } from '@tcg-trade-hub/database';

const makeListing = (overrides: Partial<ListingRow> = {}): ListingRow => ({
  id: 'listing-1',
  user_id: 'user-1',
  type: 'wts',
  tcg: 'pokemon',
  title: 'Charizard VMAX Bundle',
  cash_amount: 140,
  total_value: 150,
  description: null,
  photos: [],
  trade_wants: [],
  accepts_cash: true,
  accepts_trades: false,
  status: 'active',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

const userLocation = { latitude: -37.8136, longitude: 144.9631 };

describe('rankListings', () => {
  it('should score TCG matches higher than non-matching TCGs', () => {
    const listings = [
      makeListing({ id: 'l1', tcg: 'mtg', title: 'Black Lotus Bundle' }),
      makeListing({ id: 'l2', tcg: 'pokemon', title: 'Pikachu Bundle' }),
    ];
    const userListings = [
      makeListing({ id: 'u1', tcg: 'pokemon', user_id: 'me' }),
    ];

    const result = rankListings(listings, userListings, userLocation);
    expect(result[0]!.listing.id).toBe('l2');
  });

  it('should rank newer listings higher', () => {
    const now = Date.now();
    const listings = [
      makeListing({
        id: 'old',
        created_at: new Date(now - 6 * 24 * 60 * 60 * 1000).toISOString(),
      }),
      makeListing({
        id: 'new',
        created_at: new Date(now).toISOString(),
      }),
    ];

    const result = rankListings(listings, [], userLocation);
    expect(result[0]!.listing.id).toBe('new');
  });

  it('should return empty array for empty input', () => {
    const result = rankListings([], [], userLocation);
    expect(result).toEqual([]);
  });

  it('should return all listings with scores', () => {
    const listings = [
      makeListing({ id: 'l1' }),
      makeListing({ id: 'l2' }),
      makeListing({ id: 'l3' }),
    ];

    const result = rankListings(listings, [], userLocation);
    expect(result).toHaveLength(3);
    result.forEach((r) => {
      expect(r).toHaveProperty('listing');
      expect(r).toHaveProperty('score');
      expect(typeof r.score).toBe('number');
    });
  });

  it('should not crash when user has listings but no TCG overlap', () => {
    const listings = [
      makeListing({ id: 'l1', tcg: 'pokemon' }),
    ];
    const userListings = [
      makeListing({ id: 'u1', tcg: 'mtg', user_id: 'me' }),
    ];

    const result = rankListings(listings, userListings, userLocation);
    expect(result).toHaveLength(1);
    expect(result[0]!.score).toBeGreaterThanOrEqual(0);
  });
});
