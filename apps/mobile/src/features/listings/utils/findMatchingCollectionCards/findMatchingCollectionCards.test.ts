import { describe, it, expect } from 'vitest';
import findMatchingCollectionCards from './findMatchingCollectionCards';
import type { CollectionItemRow, TradeWant } from '@tcg-trade-hub/database';

const makeCollectionItem = (overrides: Partial<CollectionItemRow> = {}): CollectionItemRow => ({
  id: 'col-1',
  user_id: 'user-1',
  tcg: 'pokemon',
  external_id: 'sv4-6',
  card_name: 'Charizard VMAX',
  set_name: 'Obsidian Flames',
  set_code: 'sv4',
  card_number: '6',
  image_url: 'https://example.com/charizard.png',
  rarity: 'Ultra Rare',
  condition: 'nm',
  quantity: 1,
  is_wishlist: false,
  market_price: 25.0,
  grading_company: null,
  grading_score: null,
  is_sealed: false,
  product_type: null,
  purchase_price: null,
  photos: [],
  notes: null,
  acquired_at: null,
  is_tradeable: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

describe('findMatchingCollectionCards', () => {
  it('should return empty array when no trade wants', () => {
    const result = findMatchingCollectionCards([], [makeCollectionItem()]);
    expect(result).toEqual([]);
  });

  it('should return empty array when no collection items', () => {
    const wants: TradeWant[] = [{ type: 'open_to_offers' }];
    const result = findMatchingCollectionCards(wants, []);
    expect(result).toEqual([]);
  });

  it('should match specific_card by external_id', () => {
    const wants: TradeWant[] = [
      { type: 'specific_card', card_external_id: 'sv4-6', card_name: 'Charizard VMAX', card_image_url: null, tcg: 'pokemon' },
    ];
    const collection = [
      makeCollectionItem({ id: 'col-1', external_id: 'sv4-6' }),
      makeCollectionItem({ id: 'col-2', external_id: 'sv4-100', card_name: 'Pikachu' }),
    ];

    const result = findMatchingCollectionCards(wants, collection);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('col-1');
  });

  it('should match sealed products', () => {
    const wants: TradeWant[] = [{ type: 'sealed', product_type: 'booster_box' }];
    const collection = [
      makeCollectionItem({ id: 'col-sealed', is_sealed: true, product_type: 'booster_box' }),
      makeCollectionItem({ id: 'col-raw', is_sealed: false }),
    ];

    const result = findMatchingCollectionCards(wants, collection);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('col-sealed');
  });

  it('should match any sealed when product_type is null', () => {
    const wants: TradeWant[] = [{ type: 'sealed', product_type: null }];
    const collection = [
      makeCollectionItem({ id: 'col-box', is_sealed: true, product_type: 'booster_box' }),
      makeCollectionItem({ id: 'col-etb', is_sealed: true, product_type: 'etb' }),
      makeCollectionItem({ id: 'col-raw', is_sealed: false }),
    ];

    const result = findMatchingCollectionCards(wants, collection);
    expect(result).toHaveLength(2);
  });

  it('should match slabs by grading company and min grade', () => {
    const wants: TradeWant[] = [{ type: 'slab', grading_company: 'psa', min_grade: 9 }];
    const collection = [
      makeCollectionItem({ id: 'col-psa10', grading_company: 'psa', grading_score: '10' }),
      makeCollectionItem({ id: 'col-psa8', grading_company: 'psa', grading_score: '8' }),
      makeCollectionItem({ id: 'col-cgc9', grading_company: 'cgc', grading_score: '9.5' }),
      makeCollectionItem({ id: 'col-raw', grading_company: null }),
    ];

    const result = findMatchingCollectionCards(wants, collection);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('col-psa10');
  });

  it('should match raw cards with condition filter', () => {
    const wants: TradeWant[] = [{ type: 'raw_cards', min_condition: 'lp' }];
    const collection = [
      makeCollectionItem({ id: 'col-nm', condition: 'nm' }),
      makeCollectionItem({ id: 'col-lp', condition: 'lp' }),
      makeCollectionItem({ id: 'col-hp', condition: 'hp' }),
      makeCollectionItem({ id: 'col-graded', grading_company: 'psa', grading_score: '10' }),
    ];

    const result = findMatchingCollectionCards(wants, collection);
    expect(result).toHaveLength(2);
    expect(result.map((r) => r.id).sort()).toEqual(['col-lp', 'col-nm']);
  });

  it('should match open_to_offers against all items', () => {
    const wants: TradeWant[] = [{ type: 'open_to_offers' }];
    const collection = [
      makeCollectionItem({ id: 'col-1' }),
      makeCollectionItem({ id: 'col-2', external_id: 'sv4-100' }),
    ];

    const result = findMatchingCollectionCards(wants, collection);
    expect(result).toHaveLength(2);
  });

  it('should not duplicate items matched by multiple wants', () => {
    const wants: TradeWant[] = [
      { type: 'specific_card', card_external_id: 'sv4-6', card_name: 'Charizard', card_image_url: null, tcg: 'pokemon' },
      { type: 'raw_cards', min_condition: null },
    ];
    const collection = [makeCollectionItem({ id: 'col-1', external_id: 'sv4-6' })];

    const result = findMatchingCollectionCards(wants, collection);
    expect(result).toHaveLength(1);
  });
});
