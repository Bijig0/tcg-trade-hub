import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthProvider';

const THROTTLE_MS = 2_000;
const AUTO_CLEAR_MS = 4_000;

type TypingEvent = {
  userId: string;
  event: 'start' | 'stop';
};

/**
 * Broadcast-based typing indicator for a conversation.
 *
 * Uses Supabase Realtime Broadcast (no persistence) on channel `typing:{conversationId}`.
 * - `sendTypingStart()` fires at most once every 2 s.
 * - `sendTypingStop()` fires immediately.
 * - `isOtherUserTyping` auto-clears after 4 s without a stop event.
 */
const useTypingIndicator = (conversationId: string) => {
  const { user } = useAuth();
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const lastSentRef = useRef(0);
  const clearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Subscribe to typing events from the other user
  useEffect(() => {
    if (!conversationId || !user) return;

    const channel = supabase.channel(`typing:${conversationId}`);
    channelRef.current = channel;

    channel
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        const data = payload as TypingEvent;
        if (data.userId === user.id) return; // Ignore own events

        if (data.event === 'start') {
          setIsOtherUserTyping(true);

          // Auto-clear after 4 s
          if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
          clearTimerRef.current = setTimeout(() => {
            setIsOtherUserTyping(false);
          }, AUTO_CLEAR_MS);
        } else {
          setIsOtherUserTyping(false);
          if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
        }
      })
      .subscribe();

    return () => {
      if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [conversationId, user]);

  const sendTypingStart = useCallback(() => {
    if (!user || !channelRef.current) return;

    const now = Date.now();
    if (now - lastSentRef.current < THROTTLE_MS) return;
    lastSentRef.current = now;

    channelRef.current.send({
      type: 'broadcast',
      event: 'typing',
      payload: { userId: user.id, event: 'start' } satisfies TypingEvent,
    });
  }, [user]);

  const sendTypingStop = useCallback(() => {
    if (!user || !channelRef.current) return;

    lastSentRef.current = 0; // Reset throttle so next start fires immediately

    channelRef.current.send({
      type: 'broadcast',
      event: 'typing',
      payload: { userId: user.id, event: 'stop' } satisfies TypingEvent,
    });
  }, [user]);

  return { isOtherUserTyping, sendTypingStart, sendTypingStop };
};

export default useTypingIndicator;
