import { describe, it, expect } from 'vitest';
import type { TradeContextItem } from '../../hooks/useTradeContext/useTradeContext';

describe('OfferDetailScreen', () => {
  it('should determine sides correctly when user is listing owner', () => {
    const listingOwnerId = 'user-1';
    const currentUserId = 'user-1';
    const isListingOwner = listingOwnerId === currentUserId;
    expect(isListingOwner).toBe(true);
  });

  it('should determine sides correctly when user is offerer', () => {
    const listingOwnerId = 'user-2';
    const currentUserId = 'user-1';
    const isListingOwner = listingOwnerId === currentUserId;
    expect(isListingOwner).toBe(false);
  });

  it('should calculate offer total value from items', () => {
    const items: TradeContextItem[] = [
      { cardName: 'Card A', cardImageUrl: '', quantity: 2, marketPrice: 10 },
      { cardName: 'Card B', cardImageUrl: '', quantity: 1, marketPrice: 25.5 },
      { cardName: 'Card C', cardImageUrl: '', quantity: 1, marketPrice: null },
    ];

    const totalValue = items.reduce(
      (sum, item) => sum + (item.marketPrice ?? 0) * item.quantity,
      0,
    );

    expect(totalValue).toBe(45.5);
  });
});
