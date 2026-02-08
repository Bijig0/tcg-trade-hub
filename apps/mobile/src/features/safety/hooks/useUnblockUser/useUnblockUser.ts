import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthProvider';

type UnblockUserParams = {
  blockedId: string;
};

/**
 * Hook that unblocks a user by deleting from the blocks table
 * where blocker_id is the current user and blocked_id is the target.
 */
const useUnblockUser = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ blockedId }: UnblockUserParams) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('blocks')
        .delete()
        .eq('blocker_id', user.id)
        .eq('blocked_id', blockedId);

      if (error) throw error;
      return { blockedId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocked-users'] });
    },
    onError: (error: Error) => {
      Alert.alert('Error', error.message ?? 'Failed to unblock user');
    },
  });
};

export default useUnblockUser;
