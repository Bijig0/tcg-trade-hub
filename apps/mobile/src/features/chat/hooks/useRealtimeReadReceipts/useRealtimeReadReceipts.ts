import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthProvider';
import { chatKeys } from '../../queryKeys';

/**
 * Subscribes to Supabase Realtime postgres_changes on the conversation_reads
 * table for a given conversation. When the other user updates their read receipt,
 * invalidates the read receipt query so the UI reflects the latest state.
 *
 * Ignores updates from the current user to avoid unnecessary re-fetches.
 */
const useRealtimeReadReceipts = (conversationId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!conversationId || !user) return;

    const channel = supabase
      .channel(`read-receipts-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversation_reads',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          // Ignore own read receipt updates
          const record = payload.new as { user_id?: string } | undefined;
          if (record?.user_id === user.id) return;

          queryClient.invalidateQueries({
            queryKey: chatKeys.readReceipt(conversationId),
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, user, queryClient]);
};

export default useRealtimeReadReceipts;
