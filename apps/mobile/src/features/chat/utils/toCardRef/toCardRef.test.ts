import { describe, it, expect } from 'vitest';
import { toCardRef, fromCardRef, collectionItemToTradeItem } from './toCardRef';
import type { TradeContextItem } from '../../hooks/useTradeContext/useTradeContext';
import type { CollectionItemRow } from '@tcg-trade-hub/database';

const mockTradeItem: TradeContextItem = {
  cardName: 'Charizard VMAX',
  cardImageUrl: 'https://images.example.com/charizard.png',
  cardExternalId: 'swsh4-20',
  tcg: 'pokemon',
  condition: 'nm',
  quantity: 1,
  marketPrice: 45.99,
};

describe('toCardRef', () => {
  it('converts a TradeContextItem to CardRef', () => {
    const result = toCardRef(mockTradeItem);

    expect(result).toEqual({
      externalId: 'swsh4-20',
      tcg: 'pokemon',
      name: 'Charizard VMAX',
      imageUrl: 'https://images.example.com/charizard.png',
      condition: 'nm',
      quantity: 1,
    });
  });

  it('preserves quantity > 1', () => {
    const result = toCardRef({ ...mockTradeItem, quantity: 3 });
    expect(result.quantity).toBe(3);
  });
});

describe('fromCardRef', () => {
  it('converts a CardRef back to TradeContextItem with null marketPrice', () => {
    const ref = toCardRef(mockTradeItem);
    const result = fromCardRef(ref);

    expect(result).toEqual({
      cardName: 'Charizard VMAX',
      cardImageUrl: 'https://images.example.com/charizard.png',
      cardExternalId: 'swsh4-20',
      tcg: 'pokemon',
      condition: 'nm',
      quantity: 1,
      marketPrice: null,
    });
  });

  it('defaults condition to nm when undefined', () => {
    const result = fromCardRef({
      externalId: 'xy-1',
      tcg: 'pokemon',
      name: 'Pikachu',
      imageUrl: 'https://images.example.com/pikachu.png',
    });

    expect(result.condition).toBe('nm');
  });

  it('defaults quantity to 1 when undefined', () => {
    const result = fromCardRef({
      externalId: 'xy-1',
      tcg: 'pokemon',
      name: 'Pikachu',
      imageUrl: 'https://images.example.com/pikachu.png',
    });

    expect(result.quantity).toBe(1);
  });
});

describe('collectionItemToTradeItem', () => {
  it('converts a CollectionItemRow to TradeContextItem preserving market_price', () => {
    const collectionItem = {
      id: 'ci-1',
      user_id: 'user-1',
      tcg: 'pokemon',
      external_id: 'swsh4-20',
      card_name: 'Charizard VMAX',
      set_name: 'Vivid Voltage',
      set_code: 'swsh4',
      card_number: '20',
      image_url: 'https://images.example.com/charizard.png',
      rarity: 'Ultra Rare',
      condition: 'nm',
      quantity: 2,
      is_wishlist: false,
      market_price: 45.99,
      grading_company: null,
      grading_score: null,
      is_sealed: false,
      product_type: null,
      purchase_price: null,
      photos: [],
      notes: null,
      acquired_at: null,
      is_tradeable: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    } as CollectionItemRow;

    const result = collectionItemToTradeItem(collectionItem);

    expect(result).toEqual({
      cardName: 'Charizard VMAX',
      cardImageUrl: 'https://images.example.com/charizard.png',
      cardExternalId: 'swsh4-20',
      tcg: 'pokemon',
      condition: 'nm',
      quantity: 2,
      marketPrice: 45.99,
    });
  });

  it('preserves null market_price', () => {
    const collectionItem = {
      id: 'ci-2',
      user_id: 'user-1',
      tcg: 'pokemon',
      external_id: 'xy-1',
      card_name: 'Pikachu',
      set_name: 'XY',
      set_code: 'xy',
      card_number: '1',
      image_url: 'https://images.example.com/pikachu.png',
      rarity: null,
      condition: 'lp',
      quantity: 1,
      is_wishlist: false,
      market_price: null,
      grading_company: null,
      grading_score: null,
      is_sealed: false,
      product_type: null,
      purchase_price: null,
      photos: [],
      notes: null,
      acquired_at: null,
      is_tradeable: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    } as CollectionItemRow;

    const result = collectionItemToTradeItem(collectionItem);
    expect(result.marketPrice).toBeNull();
  });
});
