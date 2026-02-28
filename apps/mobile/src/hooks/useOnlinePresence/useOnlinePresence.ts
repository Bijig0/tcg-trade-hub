import { useEffect, useState, useCallback } from 'react';
import { AppState } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthProvider';

/**
 * Tracks online presence using Supabase Realtime Presence.
 * Automatically tracks/untracks when the app goes to background/foreground.
 *
 * Returns the set of online user IDs and a convenience `isOnline` checker.
 */
const useOnlinePresence = () => {
  const { user } = useAuth();
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());

  const isOnline = useCallback(
    (userId: string) => onlineUserIds.has(userId),
    [onlineUserIds],
  );

  useEffect(() => {
    if (!user) return;

    const channel = supabase.channel('presence:global', {
      config: { presence: { key: user.id } },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const ids = new Set(Object.keys(state));
        setOnlineUserIds(ids);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ online_at: new Date().toISOString() });
        }
      });

    // Track/untrack based on app state
    const subscription = AppState.addEventListener('change', async (nextState) => {
      if (nextState === 'active') {
        await channel.track({ online_at: new Date().toISOString() });
      } else {
        await channel.untrack();
      }
    });

    return () => {
      subscription.remove();
      supabase.removeChannel(channel);
    };
  }, [user]);

  return { onlineUserIds, isOnline };
};

export default useOnlinePresence;
