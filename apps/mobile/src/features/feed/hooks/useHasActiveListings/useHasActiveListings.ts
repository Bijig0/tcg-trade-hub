import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthProvider';

/**
 * Lightweight check for whether the current user has any active listings.
 *
 * Uses a head-only count query (fetches zero row data) so it's as cheap as
 * possible. Returns `{ hasListings, isLoading }`.
 */
const useHasActiveListings = () => {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['user-has-active-listings', user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { count, error } = await supabase
        .from('listings')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (error) throw error;
      return count ?? 0;
    },
    enabled: !!user,
  });

  return {
    hasListings: (data ?? 0) > 0,
    isLoading,
  };
};

export default useHasActiveListings;
