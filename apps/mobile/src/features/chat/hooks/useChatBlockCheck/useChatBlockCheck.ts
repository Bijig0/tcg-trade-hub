import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthProvider';

export type ChatBlockState = {
  isBlocked: boolean;
  blockedByMe: boolean;
  blockedByThem: boolean;
};

/**
 * Checks if there is a block between the current user and another user.
 * Calls the `is_blocked_between` RPC function (SECURITY DEFINER)
 * which can check both directions.
 */
const useChatBlockCheck = (otherUserId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['chat-block-check', otherUserId],
    queryFn: async (): Promise<ChatBlockState> => {
      const { data, error } = await supabase.rpc('is_blocked_between', {
        p_other_user_id: otherUserId,
      });

      if (error) throw error;

      const row = Array.isArray(data) ? data[0] : data;
      const blockedByMe = row?.blocked_by_me ?? false;
      const blockedByThem = row?.blocked_by_them ?? false;

      return {
        isBlocked: blockedByMe || blockedByThem,
        blockedByMe,
        blockedByThem,
      };
    },
    enabled: !!user && !!otherUserId,
    staleTime: 30_000,
  });
};

export default useChatBlockCheck;
