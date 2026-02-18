import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthProvider';
import { listingKeys } from '@/features/listings/queryKeys';
import { chatKeys } from '@/features/chat/queryKeys';
import { meetupKeys } from '@/features/meetups/queryKeys';
import { profileKeys } from '@/features/profile/queryKeys';
import type { ListingRow, MeetupRow, ShopRow, UserRow, MessageType } from '@tcg-trade-hub/database';

type ConversationPreview = {
  conversationId: string;
  matchId: string;
  otherUser: {
    id: string;
    name: string;
    avatar: string | null;
    rating: number;
  };
  lastMessage: {
    body: string | null;
    type: MessageType;
    createdAt: string;
  } | null;
  unreadCount: number;
};

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

    // Listings tab
    queryClient.prefetchQuery<ListingRow[]>({
      queryKey: listingKeys.myListings(),
      queryFn: async () => {
        const { data, error } = await supabase
          .from('listings')
          .select('*')
          .eq('user_id', user.id)
          .in('status', ['active', 'matched'])
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data as ListingRow[];
      },
    });

    // Conversations tab
    queryClient.prefetchQuery<ConversationPreview[]>({
      queryKey: chatKeys.conversations(),
      queryFn: async () => {
        const { data: conversations, error } = await supabase
          .from('conversations')
          .select(
            `
            id,
            match_id,
            matches!inner (
              id,
              user_a_id,
              user_b_id
            )
          `,
          )
          .or(
            `matches.user_a_id.eq.${user.id},matches.user_b_id.eq.${user.id}`,
          );

        if (error) throw error;
        if (!conversations || conversations.length === 0) return [];

        const results: ConversationPreview[] = [];

        for (const conv of conversations) {
          const match = conv.matches as unknown as {
            id: string;
            user_a_id: string;
            user_b_id: string;
          };

          const otherUserId =
            match.user_a_id === user.id ? match.user_b_id : match.user_a_id;

          const { data: otherUserData } = await supabase
            .from('users')
            .select('id, display_name, avatar_url, rating_score')
            .eq('id', otherUserId)
            .single();

          const { data: lastMessageData } = await supabase
            .from('messages')
            .select('body, type, created_at')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          results.push({
            conversationId: conv.id,
            matchId: match.id,
            otherUser: {
              id: otherUserData?.id ?? otherUserId,
              name: otherUserData?.display_name ?? 'Unknown',
              avatar: otherUserData?.avatar_url ?? null,
              rating: otherUserData?.rating_score ?? 0,
            },
            lastMessage: lastMessageData
              ? {
                  body: lastMessageData.body,
                  type: lastMessageData.type,
                  createdAt: lastMessageData.created_at,
                }
              : null,
            unreadCount: 0,
          });
        }

        results.sort((a, b) => {
          const dateA = a.lastMessage?.createdAt ?? '';
          const dateB = b.lastMessage?.createdAt ?? '';
          return dateB.localeCompare(dateA);
        });

        return results;
      },
    });

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
