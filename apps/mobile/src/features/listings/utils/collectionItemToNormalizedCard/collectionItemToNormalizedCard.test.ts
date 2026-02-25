import { describe, it, expect } from 'vitest';
import collectionItemToNormalizedCard from './collectionItemToNormalizedCard';
import type { CollectionItemRow } from '@tcg-trade-hub/database';

const makeItem = (overrides: Partial<CollectionItemRow> = {}): CollectionItemRow => ({
  id: 'item-1',
  user_id: 'user-1',
  tcg: 'pokemon',
  external_id: 'sv4-123',
  card_name: 'Charizard ex',
  set_name: 'Paradox Rift',
  set_code: 'sv4',
  card_number: '123',
  image_url: 'https://images.pokemontcg.io/sv4/123.png',
  rarity: 'Double Rare',
  condition: 'nm',
  quantity: 1,
  is_wishlist: false,
  is_tradeable: true,
  market_price: 12.5,
  grading_company: null,
  grading_score: null,
  is_sealed: false,
  product_type: null,
  purchase_price: null,
  photos: [],
  notes: null,
  acquired_at: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  ...overrides,
});

describe('collectionItemToNormalizedCard', () => {
  it('should map all fields correctly', () => {
    const item = makeItem();
    const result = collectionItemToNormalizedCard(item);

    expect(result).toEqual({
      externalId: 'sv4-123',
      tcg: 'pokemon',
      name: 'Charizard ex',
      setName: 'Paradox Rift',
      setCode: 'sv4',
      number: '123',
      imageUrl: 'https://images.pokemontcg.io/sv4/123.png',
      marketPrice: 12.5,
      rarity: 'Double Rare',
    });
  });

  it('should default null rarity to empty string', () => {
    const item = makeItem({ rarity: null });
    const result = collectionItemToNormalizedCard(item);

    expect(result.rarity).toBe('');
  });

  it('should pass through null market_price', () => {
    const item = makeItem({ market_price: null });
    const result = collectionItemToNormalizedCard(item);

    expect(result.marketPrice).toBeNull();
  });
});
