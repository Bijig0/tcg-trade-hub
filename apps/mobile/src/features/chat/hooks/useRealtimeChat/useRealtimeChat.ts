import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthProvider';
import { chatKeys } from '../../queryKeys';
import type { MessageRow, UserRow } from '@tcg-trade-hub/database';
import type { MessageWithSender } from '../useMessages/useMessages';
import type { InfiniteData } from '@tanstack/react-query';

const NEGOTIATION_MESSAGE_TYPES = new Set([
  'card_offer',
  'card_offer_response',
  'meetup_proposal',
  'meetup_response',
]);

type UseRealtimeChatOptions = {
  /** Called when a new message from the other user arrives. */
  onNewMessage?: (message: MessageRow) => void;
};

/**
 * Subscribes to Supabase Realtime for new messages in a conversation.
 * On INSERT, adds the message to the TanStack Query cache.
 *
 * Also invalidates trade context when negotiation-related messages arrive,
 * and calls an optional onNewMessage callback for read tracking.
 */
const useRealtimeChat = (
  conversationId: string,
  options?: UseRealtimeChatOptions,
) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on<MessageRow>(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          const newMessage = payload.new;

          // Don't duplicate our own optimistically-added messages
          if (newMessage.sender_id === user?.id) return;

          // Notify caller (for read tracking)
          options?.onNewMessage?.(newMessage);

          // Fetch the sender info
          const { data: senderData } = await supabase
            .from('users')
            .select('id, display_name, avatar_url')
            .eq('id', newMessage.sender_id)
            .single();

          const messageWithSender: MessageWithSender = {
            ...newMessage,
            sender: (senderData as Pick<
              UserRow,
              'id' | 'display_name' | 'avatar_url'
            >) ?? {
              id: newMessage.sender_id,
              display_name: 'Unknown',
              avatar_url: null,
            },
          };

          const messagesKey = chatKeys.messages(conversationId);

          queryClient.setQueryData<InfiniteData<MessageWithSender[]>>(
            messagesKey,
            (old) => {
              if (!old) {
                return {
                  pages: [[messageWithSender]],
                  pageParams: [null],
                };
              }

              // Prevent duplicates
              const allIds = old.pages.flatMap((page) =>
                page.map((m) => m.id),
              );
              if (allIds.includes(messageWithSender.id)) return old;

              return {
                ...old,
                pages: [
                  [messageWithSender, ...(old.pages[0] ?? [])],
                  ...old.pages.slice(1),
                ],
              };
            },
          );

          // Also invalidate conversations list to update last message
          queryClient.invalidateQueries({
            queryKey: chatKeys.conversations(),
          });

          // Invalidate trade context for negotiation-related messages
          if (NEGOTIATION_MESSAGE_TYPES.has(newMessage.type)) {
            queryClient.invalidateQueries({
              queryKey: chatKeys.tradeContext(conversationId),
            });
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, queryClient, user?.id, options]);
};

export default useRealtimeChat;
