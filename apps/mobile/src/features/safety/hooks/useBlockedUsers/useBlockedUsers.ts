import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthProvider';

export type BlockedUser = {
  id: string;
  blocked_id: string;
  display_name: string;
  avatar_url: string | null;
  created_at: string;
};

/**
 * Hook that fetches all blocked users for the current user.
 *
 * Returns each blocked user's display_name and avatar_url
 * along with the block record ID and timestamp.
 */
const useBlockedUsers = () => {
  const { user } = useAuth();

  return useQuery<BlockedUser[], Error>({
    queryKey: ['blocked-users'],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const { data: blocks, error } = await supabase
        .from('blocks')
        .select('id, blocked_id, created_at')
        .eq('blocker_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!blocks || blocks.length === 0) return [];

      // Fetch blocked users' profiles
      const blockedIds = blocks.map((b) => b.blocked_id);
      const { data: users } = await supabase
        .from('users')
        .select('id, display_name, avatar_url')
        .in('id', blockedIds);

      const usersMap = new Map(
        (users ?? []).map((u) => [u.id, u]),
      );

      return blocks.map((block) => {
        const blockedUser = usersMap.get(block.blocked_id);
        return {
          id: block.id,
          blocked_id: block.blocked_id,
          display_name: blockedUser?.display_name ?? 'Unknown',
          avatar_url: blockedUser?.avatar_url ?? null,
          created_at: block.created_at,
        };
      });
    },
    enabled: !!user,
  });
};

export default useBlockedUsers;
