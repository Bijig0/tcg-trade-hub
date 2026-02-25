import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthProvider';
import { meetupKeys } from '@/features/meetups/queryKeys';
import { profileKeys } from '@/features/profile/queryKeys';
import { listingKeys } from '@/features/listings/queryKeys';
import { feedKeys } from '@/features/feed/queryKeys';
import { collectionKeys } from '@/features/collection/queryKeys';
import { fetchMyListings } from '@/features/listings/hooks/useMyListings/useMyListings';
import { fetchLikedListings } from '@/features/feed/hooks/useLikedListings/useLikedListings';
import { fetchMyCollection } from '@/features/collection/hooks/useMyCollection/useMyCollection';
import { fetchMySealedProducts } from '@/features/collection/hooks/useMySealedProducts/useMySealedProducts';
import type { MeetupRow, ShopRow, UserRow } from '@tcg-trade-hub/database';

type MeetupWithDetails = MeetupRow & {
  shop: Pick<ShopRow, 'id' | 'name' | 'address'> | null;
  other_user: Pick<UserRow, 'id' | 'display_name' | 'avatar_url' | 'rating_score'>;
  match: { id: string; user_a_id: string; user_b_id: string };
};

type MeetupsResult = {
  upcoming: MeetupWithDetails[];
  past: MeetupWithDetails[];
};

type UserRating = {
  id: string;
  score: number;
  comment: string | null;
  created_at: string;
  rater_display_name: string;
};

/**
 * Prefetches data for all non-active tab screens so they load instantly
 * when the user navigates to them. Called once from the home screen.
 */
const usePrefetchTabs = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Listings sub-tabs (uses same extracted queryFn as hooks — cache shape guaranteed)
    queryClient.prefetchQuery({
      queryKey: listingKeys.myListings(),
      queryFn: () => fetchMyListings(user.id),
    });
    queryClient.prefetchQuery({
      queryKey: feedKeys.liked(),
      queryFn: () => fetchLikedListings(user.id),
    });
    queryClient.prefetchQuery({
      queryKey: collectionKeys.myCollection(),
      queryFn: () => fetchMyCollection(user.id),
    });
    queryClient.prefetchQuery({
      queryKey: collectionKeys.mySealedProducts(),
      queryFn: () => fetchMySealedProducts(user.id),
    });

    // Conversations tab: NOT prefetched here because useConversations has a
    // complex query shape (negotiation_status, nested listings, RPC unread counts)
    // that diverges from a simplified prefetch. Extracting the queryFn is a future refactor.

    // Meetups tab
    queryClient.prefetchQuery<MeetupsResult>({
      queryKey: meetupKeys.all,
      queryFn: async () => {
        const { data, error } = await supabase
          .from('meetups')
          .select(
            `
            *,
            match:matches!match_id (
              id,
              user_a_id,
              user_b_id
            ),
            shop:shops!shop_id (
              id,
              name,
              address
            )
          `,
          )
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (!data) return { upcoming: [], past: [] };

        const userMeetups = data.filter((meetup: Record<string, unknown>) => {
          const match = meetup.match as { user_a_id: string; user_b_id: string } | null;
          return match && (match.user_a_id === user.id || match.user_b_id === user.id);
        });

        const otherUserIds = userMeetups.map((meetup: Record<string, unknown>) => {
          const match = meetup.match as { user_a_id: string; user_b_id: string };
          return match.user_a_id === user.id ? match.user_b_id : match.user_a_id;
        });

        const uniqueUserIds = [...new Set(otherUserIds)];

        const { data: usersData } = await supabase
          .from('users')
          .select('id, display_name, avatar_url, rating_score')
          .in('id', uniqueUserIds);

        const usersMap = new Map(
          (usersData ?? []).map((u) => [u.id, u]),
        );

        const enriched: MeetupWithDetails[] = userMeetups.map((meetup: Record<string, unknown>) => {
          const match = meetup.match as { id: string; user_a_id: string; user_b_id: string };
          const otherUserId = match.user_a_id === user.id ? match.user_b_id : match.user_a_id;
          const otherUser = usersMap.get(otherUserId) ?? {
            id: otherUserId,
            display_name: 'Unknown',
            avatar_url: null,
            rating_score: 0,
          };

          return {
            ...(meetup as MeetupRow),
            match,
            shop: meetup.shop as MeetupWithDetails['shop'],
            other_user: otherUser,
          };
        });

        const now = new Date().toISOString();

        const upcoming = enriched.filter(
          (m) => m.status === 'confirmed' && (m.proposed_time === null || m.proposed_time >= now),
        );

        const past = enriched.filter(
          (m) =>
            m.status === 'completed' ||
            m.status === 'cancelled' ||
            (m.status === 'confirmed' && m.proposed_time !== null && m.proposed_time < now),
        );

        return { upcoming, past };
      },
    });

    // Profile tab (ratings)
    queryClient.prefetchQuery<UserRating[]>({
      queryKey: profileKeys.ratings(user.id),
      queryFn: async () => {
        const { data: ratings, error } = await supabase
          .from('ratings')
          .select('id, score, comment, created_at, rater_id')
          .eq('ratee_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (!ratings || ratings.length === 0) return [];

        const raterIds = [...new Set(ratings.map((r) => r.rater_id))];
        const { data: raters } = await supabase
          .from('users')
          .select('id, display_name')
          .in('id', raterIds);

        const ratersMap = new Map((raters ?? []).map((r) => [r.id, r.display_name]));

        return ratings.map((r) => ({
          id: r.id,
          score: r.score,
          comment: r.comment,
          created_at: r.created_at,
          rater_display_name: ratersMap.get(r.rater_id) ?? 'Unknown',
        }));
      },
    });
  }, [user, queryClient]);
};

export default usePrefetchTabs;
