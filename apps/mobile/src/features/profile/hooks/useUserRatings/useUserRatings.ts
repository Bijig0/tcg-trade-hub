import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { profileKeys } from '../../queryKeys';

export type UserRating = {
  id: string;
  score: number;
  comment: string | null;
  created_at: string;
  rater_display_name: string;
};

/**
 * Hook that fetches all ratings for a given user.
 *
 * Returns each rating with the rater's display name, score,
 * optional comment, and date.
 */
const useUserRatings = (userId: string) => {
  return useQuery<UserRating[], Error>({
    queryKey: profileKeys.ratings(userId),
    queryFn: async () => {
      const { data: ratings, error } = await supabase
        .from('ratings')
        .select('id, score, comment, created_at, rater_id')
        .eq('ratee_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!ratings || ratings.length === 0) return [];

      // Resolve rater display names
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
    enabled: !!userId,
  });
};

export default useUserRatings;
