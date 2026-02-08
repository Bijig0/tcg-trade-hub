import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthProvider';
import { feedKeys } from '../../../feed/queryKeys';

type BlockUserParams = {
  blockedId: string;
  displayName: string;
};

/**
 * Hook that blocks a user by inserting into the blocks table.
 *
 * Shows a confirmation dialog before blocking. On success, invalidates
 * feed queries to remove the blocked user's listings from the feed.
 */
const useBlockUser = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const mutation = useMutation({
    mutationFn: async ({ blockedId }: BlockUserParams) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('blocks').insert({
        blocker_id: user.id,
        blocked_id: blockedId,
      });

      if (error) throw error;
      return { blockedId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feedKeys.all });
      queryClient.invalidateQueries({ queryKey: ['blocked-users'] });
    },
    onError: (error: Error) => {
      Alert.alert('Error', error.message ?? 'Failed to block user');
    },
  });

  const blockWithConfirmation = ({ blockedId, displayName }: BlockUserParams) => {
    Alert.alert(
      'Block User',
      `Are you sure you want to block ${displayName}? They won't be able to see your listings or message you.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block',
          style: 'destructive',
          onPress: () => mutation.mutate({ blockedId, displayName }),
        },
      ],
    );
  };

  return {
    ...mutation,
    blockWithConfirmation,
  };
};

export default useBlockUser;
