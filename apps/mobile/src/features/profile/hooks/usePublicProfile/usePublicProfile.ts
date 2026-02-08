import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { profileKeys } from '../../queryKeys';
import type { UserRow, RatingRow } from '@tcg-trade-hub/database';

export type PublicProfile = Pick<
  UserRow,
  'id' | 'display_name' | 'avatar_url' | 'preferred_tcgs' | 'rating_score' | 'total_trades' | 'created_at'
> & {
  active_listings_count: number;
  recent_ratings: Array<
    Pick<RatingRow, 'id' | 'score' | 'comment' | 'created_at'> & {
      rater_display_name: string;
    }
  >;
};

/**
 * Hook that fetches a user's public profile by ID.
 *
 * Joins the active listings count and recent ratings with rater names.
 */
const usePublicProfile = (userId: string) => {
  return useQuery<PublicProfile, Error>({
    queryKey: profileKeys.publicProfile(userId),
    queryFn: async () => {
      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('id, display_name, avatar_url, preferred_tcgs, rating_score, total_trades, created_at')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;
      if (!profile) throw new Error('User not found');

      // Count active listings
      const { count, error: countError } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'active');

      if (countError) throw countError;

      // Fetch recent ratings
      const { data: ratings, error: ratingsError } = await supabase
        .from('ratings')
        .select('id, score, comment, created_at, rater_id')
        .eq('ratee_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (ratingsError) throw ratingsError;

      // Resolve rater display names
      const raterIds = [...new Set((ratings ?? []).map((r) => r.rater_id))];
      let ratersMap = new Map<string, string>();

      if (raterIds.length > 0) {
        const { data: raters } = await supabase
          .from('users')
          .select('id, display_name')
          .in('id', raterIds);

        ratersMap = new Map((raters ?? []).map((r) => [r.id, r.display_name]));
      }

      const recentRatings = (ratings ?? []).map((r) => ({
        id: r.id,
        score: r.score,
        comment: r.comment,
        created_at: r.created_at,
        rater_display_name: ratersMap.get(r.rater_id) ?? 'Unknown',
      }));

      return {
        ...profile,
        active_listings_count: count ?? 0,
        recent_ratings: recentRatings,
      };
    },
    enabled: !!userId,
  });
};

export default usePublicProfile;
