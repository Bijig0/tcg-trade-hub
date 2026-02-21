import { describe, it, expect } from 'vitest';
import rankListings from './rankListings';
import type { ListingRow } from '@tcg-trade-hub/database';

const makeListing = (overrides: Partial<ListingRow> = {}): ListingRow => ({
  id: 'listing-1',
  user_id: 'user-1',
  type: 'wts',
  tcg: 'pokemon',
  card_name: 'Charizard VMAX',
  card_set: 'Champions Path',
  card_number: '074',
  card_external_id: 'cp-074',
  card_image_url: 'https://example.com/charizard.png',
  card_rarity: 'Ultra Rare',
  card_market_price: 150,
  condition: 'nm',
  asking_price: 140,
  description: null,
  photos: [],
  trade_wants: null,
  status: 'active',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

const userLocation = { latitude: -37.8136, longitude: 144.9631 };

describe('rankListings', () => {
  it('should prioritize direct complement matches', () => {
    const listings = [
      makeListing({ id: 'l1', card_name: 'Pikachu', type: 'wts' }),
      makeListing({ id: 'l2', card_name: 'Charizard VMAX', type: 'wts' }),
    ];
    const userListings = [
      makeListing({ id: 'u1', card_name: 'Charizard VMAX', type: 'wtb', user_id: 'me' }),
    ];

    const result = rankListings(listings, userListings, userLocation);
    expect(result[0]!.listing.id).toBe('l2');
    expect(result[0]!.score).toBeGreaterThan(result[1]!.score);
  });

  it('should score TCG matches higher than non-matching TCGs', () => {
    const listings = [
      makeListing({ id: 'l1', tcg: 'mtg', card_name: 'Black Lotus' }),
      makeListing({ id: 'l2', tcg: 'pokemon', card_name: 'Pikachu' }),
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
});
