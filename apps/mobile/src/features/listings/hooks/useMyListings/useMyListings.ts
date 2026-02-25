import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { listingKeys } from '../../queryKeys';
import { TradeWantSchema } from '@tcg-trade-hub/database';
import type { ListingRow, ListingItemRow, TradeWant } from '@tcg-trade-hub/database';
import type { MyListingWithOffers, MatchedUserInfo } from '../../schemas';

/**
 * Parses trade_wants JSONB from a listing row.
 */
const parseTradeWants = (raw: unknown): TradeWant[] => {
  try {
    const arr = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (!Array.isArray(arr)) return [];
    return arr.flatMap((item) => {
      const result = TradeWantSchema.safeParse(item);
      return result.success ? [result.data] : [];
    });
  } catch {
    return [];
  }
};

/**
 * Hook that fetches all of the current user's listings with items and offer counts,
 * enriched with match data for listings with status 'matched'.
 *
 * Returns `MyListingWithOffers[]` so the screen can group by tab (active/matched/history).
 */
const useMyListings = () => {
  return useQuery<MyListingWithOffers[], Error>({
    queryKey: listingKeys.myListings(),
    queryFn: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user ?? null;

      if (!user) throw new Error('User not authenticated');

      // 1. Fetch all user listings
      const { data: listings, error: listingsError } = await supabase
        .from('listings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (listingsError) throw listingsError;

      const allListings = (listings ?? []) as ListingRow[];

      if (allListings.length === 0) return [];

      // 2. Fetch all listing items for user's listings
      const listingIds = allListings.map((l) => l.id);
      const { data: allItems, error: itemsError } = await supabase
        .from('listing_items')
        .select('*')
        .in('listing_id', listingIds);

      if (itemsError) throw itemsError;

      const itemsByListing = new Map<string, ListingItemRow[]>();
      for (const item of (allItems ?? []) as ListingItemRow[]) {
        const existing = itemsByListing.get(item.listing_id) ?? [];
        existing.push(item);
        itemsByListing.set(item.listing_id, existing);
      }

      // 3. Count offers per listing
      const { data: offerCounts, error: offerCountError } = await supabase
        .from('offers')
        .select('listing_id')
        .in('listing_id', listingIds)
        .eq('status', 'pending');

      if (offerCountError) throw offerCountError;

      const offerCountMap = new Map<string, number>();
      for (const oc of (offerCounts ?? []) as { listing_id: string }[]) {
        offerCountMap.set(oc.listing_id, (offerCountMap.get(oc.listing_id) ?? 0) + 1);
      }

      // 4. Identify matched listings — skip match enrichment if none
      const matchedListings = allListings.filter((l) => l.status === 'matched');

      if (matchedListings.length === 0) {
        return allListings.map((l) => ({
          ...l,
          items: itemsByListing.get(l.id) ?? [],
          offer_count: offerCountMap.get(l.id) ?? 0,
          trade_wants: parseTradeWants(l.trade_wants),
          match_id: null,
          matched_user: null,
          conversation_id: null,
        }));
      }

      // 5. Fetch matches where listing_id matches
      const matchedIds = matchedListings.map((l) => l.id);
      const { data: matches, error: matchesError } = await supabase
        .from('matches')
        .select('*')
        .in('listing_id', matchedIds);

      if (matchesError) throw matchesError;

      // 6. Build match map
      const matchByListingId = new Map<
        string,
        { match_id: string; other_user_id: string }
      >();

      for (const match of matches ?? []) {
        const otherUserId = match.user_a_id === user.id ? match.user_b_id : match.user_a_id;
        matchByListingId.set(match.listing_id, {
          match_id: match.id,
          other_user_id: otherUserId,
        });
      }

      // 7. Batch-fetch other users' profiles
      const otherUserIds = [
        ...new Set([...matchByListingId.values()].map((v) => v.other_user_id)),
      ];

      const userMap = new Map<string, MatchedUserInfo>();

      if (otherUserIds.length > 0) {
        const { data: users, error: usersError } = await supabase
          .from('users')
          .select('id, display_name, avatar_url')
          .in('id', otherUserIds);

        if (usersError) throw usersError;

        for (const u of users ?? []) {
          userMap.set(u.id, {
            id: u.id,
            display_name: u.display_name,
            avatar_url: u.avatar_url,
          });
        }
      }

      // 8. Fetch conversations linked to these matches
      const matchIds = [...new Set([...matchByListingId.values()].map((v) => v.match_id))];
      const conversationMap = new Map<string, string>();

      if (matchIds.length > 0) {
        const { data: conversations, error: convoError } = await supabase
          .from('conversations')
          .select('id, match_id')
          .in('match_id', matchIds);

        if (convoError) throw convoError;

        for (const c of conversations ?? []) {
          conversationMap.set(c.match_id, c.id);
        }
      }

      // 9. Merge enrichment data onto listings
      return allListings.map((listing) => {
        const matchInfo = matchByListingId.get(listing.id);

        return {
          ...listing,
          items: itemsByListing.get(listing.id) ?? [],
          offer_count: offerCountMap.get(listing.id) ?? 0,
          trade_wants: parseTradeWants(listing.trade_wants),
          match_id: matchInfo?.match_id ?? null,
          matched_user: matchInfo ? (userMap.get(matchInfo.other_user_id) ?? null) : null,
          conversation_id: matchInfo ? (conversationMap.get(matchInfo.match_id) ?? null) : null,
        };
      });
    },
  });
};

export default useMyListings;
