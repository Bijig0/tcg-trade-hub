import { describe, it, expect } from 'vitest';
import type { TradeContextItem } from '../../hooks/useTradeContext/useTradeContext';

describe('TradeItemRow', () => {
  it('should render item data correctly', () => {
    const item: TradeContextItem = {
      cardName: 'Charizard VMAX',
      cardImageUrl: 'https://example.com/charizard.png',
      quantity: 1,
      marketPrice: 45.99,
    };

    expect(item.cardName).toBe('Charizard VMAX');
    expect(item.marketPrice).toBe(45.99);
    expect(item.marketPrice?.toFixed(2)).toBe('45.99');
  });

  it('should handle null market price', () => {
    const item: TradeContextItem = {
      cardName: 'Pikachu V',
      cardImageUrl: 'https://example.com/pikachu.png',
      quantity: 2,
      marketPrice: null,
    };

    expect(item.marketPrice).toBeNull();
    expect(item.quantity).toBe(2);
  });
});
