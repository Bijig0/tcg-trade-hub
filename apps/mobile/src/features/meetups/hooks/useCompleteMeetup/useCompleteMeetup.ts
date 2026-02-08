import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { supabase } from '@/lib/supabase';
import { meetupKeys } from '../../queryKeys';

type CompleteMeetupParams = {
  meetupId: string;
};

type CompleteMeetupResponse = {
  both_completed: boolean;
  meetup_id: string;
};

/**
 * Hook that calls the complete-meetup edge function.
 *
 * Marks the current user's side as completed. When both users have
 * completed, the response indicates `both_completed: true` which
 * triggers the rating prompt via the onBothCompleted callback.
 */
const useCompleteMeetup = (onBothCompleted?: (meetupId: string) => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ meetupId }: CompleteMeetupParams) => {
      const { data, error } = await supabase.functions.invoke<CompleteMeetupResponse>(
        'complete-meetup',
        { body: { meetup_id: meetupId } },
      );

      if (error) throw error;
      if (!data) throw new Error('No response from complete-meetup');

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: meetupKeys.all });
      queryClient.invalidateQueries({ queryKey: meetupKeys.detail(data.meetup_id) });

      if (data.both_completed && onBothCompleted) {
        onBothCompleted(data.meetup_id);
      }
    },
    onError: (error: Error) => {
      Alert.alert('Error', error.message ?? 'Failed to complete meetup');
    },
  });
};

export default useCompleteMeetup;
