import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { listingKeys } from '../../queryKeys';
import { meetupKeys } from '@/features/meetups/queryKeys';
import type { MatchRow, MeetupRow } from '@tcg-trade-hub/database';

/**
 * Subscribes to Supabase Realtime for match and meetup changes.
 * - UPDATE on matches: invalidates myListings and meetup queries.
 * - INSERT/UPDATE on meetups for the given match: invalidates meetup queries.
 */
const useRealtimeMatchUpdates = (matchId: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!matchId) return;

    const channel = supabase
      .channel(`match:${matchId}`)
      .on<MatchRow>(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'matches',
          filter: `id=eq.${matchId}`,
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: listingKeys.myListings(),
          });
          queryClient.invalidateQueries({
            queryKey: meetupKeys.all,
          });
        },
      )
      .on<MeetupRow>(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'meetups',
          filter: `match_id=eq.${matchId}`,
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: meetupKeys.all,
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId, queryClient]);
};

export default useRealtimeMatchUpdates;
