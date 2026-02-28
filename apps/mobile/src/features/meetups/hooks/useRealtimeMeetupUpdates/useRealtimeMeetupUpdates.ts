import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { meetupKeys } from '../../queryKeys';

/**
 * Subscribes to Supabase Realtime postgres_changes on the meetups table
 * for a specific meetup ID. When the meetup is updated, invalidates
 * the detail and list queries to reflect the new state.
 */
const useRealtimeMeetupUpdates = (meetupId: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!meetupId) return;

    const channel = supabase
      .channel(`meetup-updates-${meetupId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'meetups',
          filter: `id=eq.${meetupId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: meetupKeys.detail(meetupId) });
          queryClient.invalidateQueries({ queryKey: meetupKeys.all });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [meetupId, queryClient]);
};

export default useRealtimeMeetupUpdates;
