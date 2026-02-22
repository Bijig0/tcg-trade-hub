import { describe, it, expect } from 'vitest';
import groupCollectionItems from './groupCollectionItems';
import type { CollectionItemRow } from '@tcg-trade-hub/database';

const makeItem = (overrides: Partial<CollectionItemRow> = {}): CollectionItemRow => ({
  id: 'item-1',
  user_id: 'user-1',
  tcg: 'pokemon',
  external_id: 'pkmn-charizard-001',
  card_name: 'Charizard',
  set_name: 'Base Set',
  set_code: 'base1',
  card_number: '4',
  image_url: 'https://example.com/charizard.png',
  rarity: 'Rare Holo',
  condition: 'nm',
  quantity: 1,
  is_wishlist: false,
  market_price: 100,
  grading_company: null,
  grading_score: null,
  is_sealed: false,
  product_type: null,
  purchase_price: null,
  photos: [],
  notes: null,
  acquired_at: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

describe('groupCollectionItems', () => {
  it('should return empty array for empty input', () => {
    expect(groupCollectionItems([])).toEqual([]);
  });

  it('should group items with the same external_id', () => {
    const items = [
      makeItem({ id: 'item-1', condition: 'nm', market_price: 100 }),
      makeItem({ id: 'item-2', condition: 'lp', market_price: 80 }),
    ];

    const groups = groupCollectionItems(items);
    expect(groups).toHaveLength(1);
    expect(groups[0]!.totalCount).toBe(2);
    expect(groups[0]!.totalValue).toBe(180);
    expect(groups[0]!.items).toHaveLength(2);
  });

  it('should keep different external_ids as separate groups', () => {
    const items = [
      makeItem({ id: 'item-1', external_id: 'pkmn-charizard-001' }),
      makeItem({ id: 'item-2', external_id: 'pkmn-pikachu-025' }),
    ];

    const groups = groupCollectionItems(items);
    expect(groups).toHaveLength(2);
  });

  it('should sort items within a group by condition (nm first)', () => {
    const items = [
      makeItem({ id: 'item-1', condition: 'hp' }),
      makeItem({ id: 'item-2', condition: 'nm' }),
      makeItem({ id: 'item-3', condition: 'mp' }),
    ];

    const groups = groupCollectionItems(items);
    expect(groups[0]!.items[0]!.condition).toBe('nm');
    expect(groups[0]!.items[1]!.condition).toBe('mp');
    expect(groups[0]!.items[2]!.condition).toBe('hp');
  });

  it('should handle items with null market_price', () => {
    const items = [
      makeItem({ id: 'item-1', market_price: 50 }),
      makeItem({ id: 'item-2', market_price: null }),
    ];

    const groups = groupCollectionItems(items);
    expect(groups[0]!.totalValue).toBe(50);
  });

  it('should multiply market_price by quantity', () => {
    const items = [
      makeItem({ id: 'item-1', quantity: 3, market_price: 10 }),
    ];

    const groups = groupCollectionItems(items);
    expect(groups[0]!.totalCount).toBe(3);
    expect(groups[0]!.totalValue).toBe(30);
  });

  it('should use the first item metadata for the group header', () => {
    const items = [
      makeItem({ id: 'item-1', card_name: 'Charizard', set_name: 'Base Set' }),
      makeItem({ id: 'item-2', card_name: 'Charizard', set_name: 'Base Set' }),
    ];

    const groups = groupCollectionItems(items);
    expect(groups[0]!.card_name).toBe('Charizard');
    expect(groups[0]!.set_name).toBe('Base Set');
    expect(groups[0]!.groupKey).toBe('pkmn-charizard-001');
  });
});
