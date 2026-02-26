import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { meetupKeys } from '../../queryKeys';
import type {
  MeetupRow,
  ShopRow,
  UserRow,
  MatchRow,
  ConversationRow,
} from '@tcg-trade-hub/database';

export type MeetupDetail = MeetupRow & {
  match: MatchRow;
  shop: ShopRow | null;
  other_user: Pick<
    UserRow,
    'id' | 'display_name' | 'avatar_url' | 'rating_score' | 'total_trades'
  >;
  conversation: Pick<ConversationRow, 'id'> | null;
  is_user_a: boolean;
};

/**
 * Hook that fetches a single meetup by ID with all joined data.
 *
 * Resolves the match, both users, the shop location, and the related
 * conversation for the match.
 */
const useMeetupDetail = (meetupId: string) => {
  return useQuery<MeetupDetail, Error>({
    queryKey: meetupKeys.detail(meetupId),
    queryFn: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user ?? null;

      if (!user) throw new Error('Not authenticated');

      const { data: meetup, error } = await supabase
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
            user_b_id,
            listing_id,
            offer_id,
            status,
            created_at,
            updated_at
          ),
          shop:shops (
            id,
            name,
            address,
            hours,
            website,
            phone,
            supported_tcgs,
            verified,
            created_at,
            updated_at
          )
        `,
        )
        .eq('id', meetupId)
        .single();

      if (error) throw error;
      if (!meetup) throw new Error('Meetup not found');

      const match = (meetup as Record<string, unknown>).match as MatchRow;
      const isUserA = match.user_a_id === user.id;
      const otherUserId = isUserA ? match.user_b_id : match.user_a_id;

      // Fetch other user's profile
      const { data: otherUser, error: userError } = await supabase
        .from('users')
        .select('id, display_name, avatar_url, rating_score, total_trades')
        .eq('id', otherUserId)
        .single();

      if (userError) throw userError;

      // Fetch the conversation for this match
      const { data: conversation } = await supabase
        .from('conversations')
        .select('id')
        .eq('match_id', match.id)
        .single();

      return {
        ...(meetup as unknown as MeetupRow),
        match,
        shop: (meetup as Record<string, unknown>).shop as ShopRow | null,
        other_user: otherUser ?? {
          id: otherUserId,
          display_name: 'Unknown',
          avatar_url: null,
          rating_score: 0,
          total_trades: 0,
        },
        conversation: conversation ?? null,
        is_user_a: isUserA,
      };
    },
    enabled: !!meetupId,
  });
};

export default useMeetupDetail;
