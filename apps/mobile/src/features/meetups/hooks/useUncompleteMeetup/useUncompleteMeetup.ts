import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { supabase } from '@/lib/supabase';
import { meetupKeys } from '../../queryKeys';

type UncompleteMeetupParams = {
  meetupId: string;
};

type UncompleteMeetupResponse = {
  meetup_id: string;
  uncompleted: boolean;
};

/**
 * Hook that undoes a meetup completion via atomic Postgres RPC.
 *
 * Resets the current user's completion flag. Only allowed while the
 * meetup is still in `confirmed` status (the other party hasn't
 * completed yet). Once both complete, finalization is irreversible.
 */
const useUncompleteMeetup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ meetupId }: UncompleteMeetupParams) => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      if (!userId) throw new Error('Not authenticated');

      const { data, error } = await supabase.rpc('uncomplete_meetup_v1', {
        p_meetup_id: meetupId,
        p_user_id: userId,
      });

      if (error) throw error;
      if (!data) throw new Error('No response from uncomplete_meetup_v1');

      return data as UncompleteMeetupResponse;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: meetupKeys.all });
      queryClient.invalidateQueries({ queryKey: meetupKeys.detail(data.meetup_id) });
    },
    onError: (error: Error) => {
      Alert.alert('Error', error.message ?? 'Failed to undo completion');
    },
  });
};

export default useUncompleteMeetup;
