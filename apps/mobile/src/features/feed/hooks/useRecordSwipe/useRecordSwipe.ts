import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { feedKeys } from '../../queryKeys';
import type { SwipeDirection, MatchRow } from '@tcg-trade-hub/database';

type RecordSwipeInput = {
  listingId: string;
  direction: SwipeDirection;
};

type RecordSwipeResponse = {
  swipe_id: string;
  match: MatchRow | null;
};

/**
 * Hook that records a swipe action (like/pass) on a listing.
 *
 * Calls the `record-swipe` edge function. On success, invalidates feed queries
 * so already-swiped listings are excluded. Returns the match object if a
 * mutual interest is detected.
 */
const useRecordSwipe = () => {
  const queryClient = useQueryClient();

  return useMutation<RecordSwipeResponse, Error, RecordSwipeInput>({
    mutationFn: async ({ listingId, direction }) => {
      const { data, error } = await supabase.functions.invoke<RecordSwipeResponse>(
        'record-swipe',
        {
          body: {
            listing_id: listingId,
            direction,
          },
        },
      );

      if (error) throw error;
      if (!data) throw new Error('No data returned from record-swipe');

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feedKeys.lists() });
    },
  });
};

export default useRecordSwipe;
