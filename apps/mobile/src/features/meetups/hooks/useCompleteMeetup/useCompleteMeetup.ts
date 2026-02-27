import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { supabase } from '@/lib/supabase';
import { meetupKeys } from '../../queryKeys';
import { devEmitter, createTraceId } from '@/services/devLiveEmitter/devLiveEmitter';
import { stateStepIndex } from '@tcg-trade-hub/database';

type CompleteMeetupParams = {
  meetupId: string;
};

type CompleteMeetupResponse = {
  both_completed: boolean;
  meetup_id: string;
};

/**
 * Hook that completes a meetup via atomic Postgres RPC.
 *
 * Marks the current user's side as completed. When both users have
 * completed, the RPC atomically finalizes the meetup, match, and
 * increments both users' total_trades. The response indicates
 * `both_completed: true` which triggers the rating prompt via
 * the onBothCompleted callback.
 *
 * @see packages/api/src/pipelines/completeMeetup/completeMeetup.ts
 */
const useCompleteMeetup = (onBothCompleted?: (meetupId: string) => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ meetupId }: CompleteMeetupParams) => {
      const stepIdx = stateStepIndex('meetup', 'confirmed', 'completed');
      const scoped = __DEV__
        ? devEmitter.forPath('pipeline:completeMeetup', createTraceId(), 'mobile:completeMeetup')
        : undefined;

      scoped?.(stepIdx, 'started');

      const {
        data: { session },
      } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      if (!userId) throw new Error('Not authenticated');

      try {
        const { data, error } = await supabase.rpc('complete_meetup_v1', {
          p_meetup_id: meetupId,
          p_user_id: userId,
        });

        if (error) throw error;
        if (!data) throw new Error('No response from complete_meetup_v1');

        scoped?.(stepIdx, 'success');
        return data as CompleteMeetupResponse;
      } catch (err) {
        scoped?.(stepIdx, 'error', { message: (err as Error).message });
        throw err;
      }
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
