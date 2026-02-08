import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthProvider';
import { meetupKeys } from '../../queryKeys';

type CancelMeetupParams = {
  meetupId: string;
  conversationId: string;
};

/**
 * Hook that cancels a meetup by updating its status and sending
 * a system message in the related chat conversation.
 */
const useCancelMeetup = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ meetupId, conversationId }: CancelMeetupParams) => {
      if (!user) throw new Error('Not authenticated');

      // Update meetup status to cancelled
      const { error: meetupError } = await supabase
        .from('meetups')
        .update({ status: 'cancelled' })
        .eq('id', meetupId);

      if (meetupError) throw meetupError;

      // Send system message in the conversation
      const { error: messageError } = await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_id: user.id,
        type: 'system',
        body: 'Meetup was cancelled.',
        payload: { event: 'meetup_cancelled' },
      });

      if (messageError) throw messageError;

      return { meetupId };
    },
    onSuccess: ({ meetupId }) => {
      queryClient.invalidateQueries({ queryKey: meetupKeys.all });
      queryClient.invalidateQueries({ queryKey: meetupKeys.detail(meetupId) });
    },
    onError: (error: Error) => {
      Alert.alert('Error', error.message ?? 'Failed to cancel meetup');
    },
  });
};

export default useCancelMeetup;
