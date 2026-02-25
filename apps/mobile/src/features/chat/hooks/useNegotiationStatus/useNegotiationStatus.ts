import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { chatKeys } from '../../queryKeys';
import type { ConversationRow } from '@tcg-trade-hub/database';

/**
 * Subscribes to Supabase Realtime postgres_changes on the conversations table
 * for a specific conversation ID. When the negotiation_status changes,
 * invalidates the trade context query to reflect the new status.
 */
const useNegotiationStatus = (conversationId: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`conversation-status:${conversationId}`)
      .on<ConversationRow>(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversations',
          filter: `id=eq.${conversationId}`,
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: chatKeys.tradeContext(conversationId),
          });
          queryClient.invalidateQueries({
            queryKey: chatKeys.conversations(),
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, queryClient]);
};

export default useNegotiationStatus;
