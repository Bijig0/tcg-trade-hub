import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthProvider';
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
 * Inserts directly into the swipes table. On success, invalidates feed queries
 * so already-swiped listings are excluded.
 */
const useRecordSwipe = () => {
  const { user } = useAuth();

  return useMutation<RecordSwipeResponse, Error, RecordSwipeInput>({
    mutationFn: async ({ listingId, direction }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('swipes')
        .insert({
          user_id: user.id,
          listing_id: listingId,
          direction,
        })
        .select('id')
        .single();

      if (error) {
        console.error('[useRecordSwipe] Error recording swipe:', error);
        throw error;
      }

      console.log(`[useRecordSwipe] Recorded ${direction} on ${listingId}`);

      // Match detection is handled server-side (triggers/functions).
      // For now, return no match — matches are created through offers.
      return {
        swipe_id: data.id,
        match: null,
      };
    },
  });
};

export default useRecordSwipe;
