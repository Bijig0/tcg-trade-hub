import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthProvider';
import { chatKeys } from '../../queryKeys';

type MarkAsReadParams = {
  conversationId: string;
  lastMessageId?: string | null;
};

/**
 * Upserts the user's read position for a conversation.
 * Call on conversation mount and when new messages arrive while focused.
 * Invalidates conversation list to update unread badges.
 */
const useMarkAsRead = (conversationId: string) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const lastMarkedRef = useRef<string | null>(null);

  const mutation = useMutation({
    mutationFn: async ({ conversationId, lastMessageId }: MarkAsReadParams) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('conversation_reads')
        .upsert(
          {
            conversation_id: conversationId,
            user_id: user.id,
            last_read_message_id: lastMessageId ?? null,
            last_read_at: new Date().toISOString(),
          },
          { onConflict: 'conversation_id,user_id' },
        );

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
    },
  });

  const markAsRead = useCallback(
    (lastMessageId?: string | null) => {
      // Deduplicate: don't re-mark the same message
      if (lastMessageId && lastMessageId === lastMarkedRef.current) return;
      if (lastMessageId) lastMarkedRef.current = lastMessageId;

      mutation.mutate({ conversationId, lastMessageId });
    },
    [conversationId, mutation],
  );

  return { markAsRead, ...mutation };
};

export default useMarkAsRead;
