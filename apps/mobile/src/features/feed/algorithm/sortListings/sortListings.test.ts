import { describe, it, expect } from 'vitest';
import sortListings from './sortListings';
import type { ListingWithDistance } from '../../schemas';

const makeListing = (overrides: Partial<ListingWithDistance>): ListingWithDistance =>
  ({
    id: 'listing-1',
    user_id: 'user-1',
    type: 'wts',
    tcg: 'pokemon',
    title: 'Test',
    cash_amount: 0,
    total_value: 0,
    description: null,
    photos: [],
    status: 'active',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    distance_km: 0,
    owner: { display_name: '', avatar_url: null, rating_score: 0, total_trades: 0 },
    items: [],
    offer_count: 0,
    ...overrides,
  }) as ListingWithDistance;

describe('sortListings', () => {
  const listings = [
    makeListing({ id: 'a', created_at: '2026-01-01T00:00:00Z', total_value: 30, distance_km: 10 }),
    makeListing({ id: 'b', created_at: '2026-01-03T00:00:00Z', total_value: 10, distance_km: 5 }),
    makeListing({ id: 'c', created_at: '2026-01-02T00:00:00Z', total_value: 50, distance_km: 1 }),
  ];

  it('should sort by newest (descending created_at)', () => {
    const result = sortListings(listings, 'newest');
    expect(result.map((l) => l.id)).toEqual(['b', 'c', 'a']);
  });

  it('should sort by price (ascending total_value)', () => {
    const result = sortListings(listings, 'price');
    expect(result.map((l) => l.id)).toEqual(['b', 'a', 'c']);
  });

  it('should sort by distance (ascending distance_km)', () => {
    const result = sortListings(listings, 'distance');
    expect(result.map((l) => l.id)).toEqual(['c', 'b', 'a']);
  });

  it('should return same reference for relevance (no-op)', () => {
    const result = sortListings(listings, 'relevance');
    expect(result).toBe(listings);
  });

  it('should not mutate the input array', () => {
    const original = [...listings];
    sortListings(listings, 'newest');
    expect(listings.map((l) => l.id)).toEqual(original.map((l) => l.id));
  });

  it('should handle empty array', () => {
    const result = sortListings([], 'newest');
    expect(result).toEqual([]);
  });

  it('should handle single item', () => {
    const single = [listings[0]!];
    const result = sortListings(single, 'price');
    expect(result).toHaveLength(1);
  });
});
