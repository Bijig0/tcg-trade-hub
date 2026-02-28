import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react-native';
import useTradeContext from './useTradeContext';
import { createQueryWrapper } from '@/test-utils/queryWrapper';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

vi.mock('@/context/AuthProvider', () => ({
  useAuth: () => ({ user: { id: 'user-1' } }),
}));

const { supabase } = await import('@/lib/supabase');

const mockConversation = {
  id: 'conv-1',
  negotiation_status: 'offer_pending',
  matches: {
    id: 'match-1',
    user_a_id: 'user-1',
    user_b_id: 'user-2',
    listing_id: 'listing-1',
    offer_id: 'offer-1',
    listings: {
      id: 'listing-1',
      user_id: 'user-1',
      title: 'Charizard VMAX',
      type: 'wts',
      tcg: 'pokemon',
      total_value: 100,
      accepts_cash: true,
      accepts_trades: false,
    },
    offers: {
      id: 'offer-1',
      offerer_id: 'user-2',
      cash_amount: 50,
    },
  },
};

const mockListingItems = [
  { card_name: 'Charizard VMAX', card_image_url: 'https://img/charizard.png', card_external_id: 'swsh4-20', tcg: 'pokemon', condition: 'nm', quantity: 1, market_price: 100 },
];

const mockOfferItems = [
  { card_name: 'Pikachu V', card_image_url: 'https://img/pikachu.png', card_external_id: 'swsh4-5', tcg: 'pokemon', condition: 'lp', quantity: 2, market_price: 25 },
];

describe('useTradeContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return null when conversationId is empty', () => {
    const { result } = renderHook(() => useTradeContext(''), {
      wrapper: createQueryWrapper(),
    });

    expect(result.current.data).toBeUndefined();
    expect(result.current.isFetching).toBe(false);
  });

  it('should return trade context data for a valid conversation', async () => {
    const mockFrom = vi.fn();
    (supabase.from as ReturnType<typeof vi.fn>).mockImplementation((table: string) => {
      if (table === 'conversations') {
        return {
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({ data: mockConversation, error: null }),
            }),
          }),
        };
      }
      if (table === 'listing_items') {
        return {
          select: () => ({
            eq: () => Promise.resolve({ data: mockListingItems, error: null }),
          }),
        };
      }
      if (table === 'offer_items') {
        return {
          select: () => ({
            eq: () => Promise.resolve({ data: mockOfferItems, error: null }),
          }),
        };
      }
      return mockFrom;
    });

    const { result } = renderHook(() => useTradeContext('conv-1'), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual({
      listingId: 'listing-1',
      listingTitle: 'Charizard VMAX',
      listingType: 'wts',
      listingTcg: 'pokemon',
      listingOwnerId: 'user-1',
      listingItems: [
        { cardName: 'Charizard VMAX', cardImageUrl: 'https://img/charizard.png', cardExternalId: 'swsh4-20', tcg: 'pokemon', condition: 'nm', quantity: 1, marketPrice: 100 },
      ],
      listingTotalValue: 100,
      offererId: 'user-2',
      offerItems: [
        { cardName: 'Pikachu V', cardImageUrl: 'https://img/pikachu.png', cardExternalId: 'swsh4-5', tcg: 'pokemon', condition: 'lp', quantity: 2, marketPrice: 25 },
      ],
      offerCashAmount: 50,
      negotiationStatus: 'offer_pending',
    });
  });
});
