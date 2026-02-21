import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { listingKeys } from '../../queryKeys';
import type { ListingRow } from '@tcg-trade-hub/database';
import type { MyListingWithMatch, MatchedUserInfo } from '../../schemas';

/**
 * Hook that fetches all of the current user's listings ordered by created_at desc,
 * enriched with match and matched-user data for listings with status 'matched'.
 *
 * Returns `MyListingWithMatch[]` so the screen can group by tab (active/matched/history).
 */
const useMyListings = () => {
  return useQuery<MyListingWithMatch[], Error>({
    queryKey: listingKeys.myListings(),
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error('User not authenticated');

      // 1. Fetch all user listings
      const { data: listings, error: listingsError } = await supabase
        .from('listings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (listingsError) throw listingsError;

      const allListings = (listings ?? []) as ListingRow[];

      // 2. Identify matched listings — skip enrichment if none
      const matchedListings = allListings.filter((l) => l.status === 'matched');

      if (matchedListings.length === 0) {
        return allListings.map((l) => ({
          ...l,
          match_id: null,
          matched_user: null,
          conversation_id: null,
        }));
      }

      // 3. Fetch matches where the user is either party
      const matchedIds = matchedListings.map((l) => l.id);
      const { data: matches, error: matchesError } = await supabase
        .from('matches')
        .select('*')
        .or(
          matchedIds.map((id) => `listing_a_id.eq.${id}`).join(',') +
            ',' +
            matchedIds.map((id) => `listing_b_id.eq.${id}`).join(','),
        );

      if (matchesError) throw matchesError;

      // 4. Build a map: listing_id → match row
      const matchByListingId = new Map<
        string,
        { match_id: string; other_user_id: string }
      >();

      for (const match of matches ?? []) {
        // Determine which listing belongs to the current user
        if (matchedIds.includes(match.listing_a_id)) {
          matchByListingId.set(match.listing_a_id, {
            match_id: match.id,
            other_user_id: match.user_b_id,
          });
        }
        if (matchedIds.includes(match.listing_b_id)) {
          matchByListingId.set(match.listing_b_id, {
            match_id: match.id,
            other_user_id: match.user_a_id,
          });
        }
      }

      // 5. Batch-fetch other users' profiles
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

      // 6. Fetch conversations linked to these matches
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

      // 7. Merge enrichment data onto listings
      return allListings.map((listing) => {
        const matchInfo = matchByListingId.get(listing.id);

        if (!matchInfo) {
          return {
            ...listing,
            match_id: null,
            matched_user: null,
            conversation_id: null,
          };
        }

        return {
          ...listing,
          match_id: matchInfo.match_id,
          matched_user: userMap.get(matchInfo.other_user_id) ?? null,
          conversation_id: conversationMap.get(matchInfo.match_id) ?? null,
        };
      });
    },
  });
};

export default useMyListings;
