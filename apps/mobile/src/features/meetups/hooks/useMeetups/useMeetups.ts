import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { meetupKeys } from '../../queryKeys';
import type { MeetupRow, ShopRow, UserRow } from '@tcg-trade-hub/database';

export type MeetupWithDetails = MeetupRow & {
  shop: Pick<ShopRow, 'id' | 'name' | 'address'> | null;
  other_user: Pick<UserRow, 'id' | 'display_name' | 'avatar_url' | 'rating_score'>;
  match: {
    id: string;
    user_a_id: string;
    user_b_id: string;
  };
};

type UseMeetupsResult = {
  upcoming: MeetupWithDetails[];
  past: MeetupWithDetails[];
};

/**
 * Hook that fetches all meetups for the current user.
 *
 * Joins matches to resolve both user IDs, then filters where the
 * current user is either user_a or user_b. Also joins shops for
 * location details. Returns meetups split into upcoming and past.
 */
const useMeetups = () => {
  return useQuery<UseMeetupsResult, Error>({
    queryKey: meetupKeys.all,
    queryFn: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user ?? null;

      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('meetups')
        .select(
          `
          id,
          match_id,
          proposal_message_id,
          shop_id,
          location_name,
          proposed_time,
          status,
          user_a_completed,
          user_b_completed,
          created_at,
          updated_at,
          match:matches (
            id,
            user_a_id,
            user_b_id
          ),
          shop:shops (
            id,
            name,
            address
          )
        `,
        )
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data || data.length === 0) return { upcoming: [], past: [] };

      // Filter meetups where current user is participant and resolve other user
      const userMeetups = data.filter((meetup: Record<string, unknown>) => {
        const match = meetup.match as { user_a_id: string; user_b_id: string } | null;
        return match && (match.user_a_id === user.id || match.user_b_id === user.id);
      });

      if (userMeetups.length === 0) return { upcoming: [], past: [] };

      // Collect other user IDs to batch-fetch their profiles
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
};

export default useMeetups;
