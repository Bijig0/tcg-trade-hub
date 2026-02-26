import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { chatKeys } from '../../queryKeys';
import type { NegotiationStatus, ListingType, TcgType } from '@tcg-trade-hub/database';

export type TradeContextItem = {
  cardName: string;
  cardImageUrl: string;
  cardExternalId: string;
  tcg: string;
  condition: string;
  quantity: number;
  marketPrice: number | null;
};

export type TradeUserProfile = {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  ratingScore: number;
  totalTrades: number;
};

export type TradeContext = {
  listingId: string;
  listingTitle: string;
  listingType: ListingType;
  listingTcg: TcgType;
  listingOwnerId: string;
  listingItems: TradeContextItem[];
  listingTotalValue: number;
  listingOwnerProfile: TradeUserProfile | null;
  offererId: string | null;
  offererProfile: TradeUserProfile | null;
  offerItems: TradeContextItem[];
  offerCashAmount: number;
  offerCashDirection: 'offering' | 'requesting' | null;
  negotiationStatus: NegotiationStatus;
};

/**
 * Fetches the trade context for a conversation — listing info, offer info,
 * and negotiation status. Joins through conversations → matches → listings/offers.
 */
const useTradeContext = (conversationId: string) => {
  return useQuery({
    queryKey: chatKeys.tradeContext(conversationId),
    queryFn: async (): Promise<TradeContext | null> => {
      // Get conversation with match, listing, and offer data
      const { data: conv, error: convError } = await supabase
        .from('conversations')
        .select(
          `
          id,
          negotiation_status,
          matches!inner (
            id,
            user_a_id,
            user_b_id,
            listing_id,
            offer_id,
            listings!inner (
              id,
              user_id,
              title,
              type,
              tcg,
              total_value
            ),
            offers!inner (
              id,
              offerer_id,
              cash_amount
            )
          )
        `,
        )
        .eq('id', conversationId)
        .single();

      if (convError || !conv) return null;

      const match = conv.matches as unknown as {
        id: string;
        user_a_id: string;
        user_b_id: string;
        listing_id: string;
        offer_id: string;
        listings: {
          id: string;
          user_id: string;
          title: string;
          type: ListingType;
          tcg: TcgType;
          total_value: number;
        };
        offers: {
          id: string;
          offerer_id: string;
          cash_amount: number;
        };
      };

      // Fetch listing items
      const { data: listingItems } = await supabase
        .from('listing_items')
        .select('card_name, card_image_url, card_external_id, tcg, condition, quantity, market_price')
        .eq('listing_id', match.listings.id);

      // Fetch offer items
      const { data: offerItems } = await supabase
        .from('offer_items')
        .select('card_name, card_image_url, card_external_id, tcg, condition, quantity, market_price')
        .eq('offer_id', match.offers.id);

      // Fetch user profiles for both sides
      const userIds = [match.listings.user_id, match.offers.offerer_id];
      const { data: profiles } = await supabase
        .from('users')
        .select('id, display_name, avatar_url, rating_score, total_trades')
        .in('id', userIds);

      const profileMap = new Map(
        (profiles ?? []).map((p) => [
          p.id,
          {
            id: p.id,
            displayName: p.display_name,
            avatarUrl: p.avatar_url,
            ratingScore: p.rating_score,
            totalTrades: p.total_trades,
          } satisfies TradeUserProfile,
        ]),
      );

      return {
        listingId: match.listings.id,
        listingTitle: match.listings.title,
        listingType: match.listings.type as ListingType,
        listingTcg: match.listings.tcg as TcgType,
        listingOwnerId: match.listings.user_id,
        listingItems: (listingItems ?? []).map((li) => ({
          cardName: li.card_name,
          cardImageUrl: li.card_image_url,
          cardExternalId: li.card_external_id,
          tcg: li.tcg,
          condition: li.condition,
          quantity: li.quantity,
          marketPrice: li.market_price,
        })),
        listingTotalValue: match.listings.total_value,
        offererId: match.offers.offerer_id,
        offerItems: (offerItems ?? []).map((oi) => ({
          cardName: oi.card_name,
          cardImageUrl: oi.card_image_url,
          cardExternalId: oi.card_external_id,
          tcg: oi.tcg,
          condition: oi.condition,
          quantity: oi.quantity,
          marketPrice: oi.market_price,
        })),
        offerCashAmount: match.offers.cash_amount,
        negotiationStatus: conv.negotiation_status as NegotiationStatus,
      };
    },
    enabled: !!conversationId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export default useTradeContext;
