import { describe, it, expect } from 'vitest';
import groupListingsByTab from './groupListingsByTab';
import type { MyListingWithOffers } from '../../schemas';

const makeListing = (
  overrides: Partial<MyListingWithOffers> & { status: MyListingWithOffers['status'] },
): MyListingWithOffers =>
  ({
    id: `listing-${Math.random().toString(36).slice(2, 8)}`,
    user_id: 'user-1',
    type: 'wts',
    tcg: 'pokemon',
    title: 'Test Bundle',
    cash_amount: 10,
    total_value: 15,
    description: null,
    photos: [],
    created_at: '2026-01-15T12:00:00Z',
    updated_at: '2026-01-15T12:00:00Z',
    items: [],
    offer_count: 0,
    match_id: null,
    matched_user: null,
    conversation_id: null,
    ...overrides,
  }) as MyListingWithOffers;

describe('groupListingsByTab', () => {
  it('should return empty groups for an empty array', () => {
    const result = groupListingsByTab([]);
    expect(result.groups.active).toEqual([]);
    expect(result.groups.matched).toEqual([]);
    expect(result.groups.history).toEqual([]);
    expect(result.counts).toEqual({ active: 0, matched: 0, history: 0 });
  });

  it('should group active listings into the active tab', () => {
    const listings = [
      makeListing({ status: 'active' }),
      makeListing({ status: 'active' }),
    ];
    const result = groupListingsByTab(listings);
    expect(result.counts.active).toBe(2);
    expect(result.counts.matched).toBe(0);
    expect(result.counts.history).toBe(0);
  });

  it('should group matched listings into the matched tab', () => {
    const listings = [
      makeListing({ status: 'matched', match_id: 'match-1' }),
    ];
    const result = groupListingsByTab(listings);
    expect(result.counts.matched).toBe(1);
    expect(result.groups.matched[0]!.match_id).toBe('match-1');
  });

  it('should group completed listings into history', () => {
    const listings = [
      makeListing({ status: 'completed' }),
    ];
    const result = groupListingsByTab(listings);
    expect(result.counts.history).toBe(1);
    expect(result.groups.history[0]!.status).toBe('completed');
  });

  it('should group expired listings into history', () => {
    const listings = [
      makeListing({ status: 'expired' }),
    ];
    const result = groupListingsByTab(listings);
    expect(result.counts.history).toBe(1);
    expect(result.groups.history[0]!.status).toBe('expired');
  });

  it('should correctly split mixed statuses across all tabs', () => {
    const listings = [
      makeListing({ status: 'active' }),
      makeListing({ status: 'matched' }),
      makeListing({ status: 'completed' }),
      makeListing({ status: 'expired' }),
      makeListing({ status: 'active' }),
      makeListing({ status: 'completed' }),
    ];
    const result = groupListingsByTab(listings);
    expect(result.counts).toEqual({ active: 2, matched: 1, history: 3 });
  });

  it('should put both completed and expired in history together', () => {
    const completed = makeListing({ status: 'completed' });
    const expired = makeListing({ status: 'expired' });
    const result = groupListingsByTab([completed, expired]);
    expect(result.groups.history).toHaveLength(2);
    expect(result.groups.history).toContain(completed);
    expect(result.groups.history).toContain(expired);
  });

  it('should preserve listing order within each group', () => {
    const first = makeListing({ status: 'active', title: 'First Bundle' });
    const second = makeListing({ status: 'active', title: 'Second Bundle' });
    const result = groupListingsByTab([first, second]);
    expect(result.groups.active[0]!.title).toBe('First Bundle');
    expect(result.groups.active[1]!.title).toBe('Second Bundle');
  });
});
