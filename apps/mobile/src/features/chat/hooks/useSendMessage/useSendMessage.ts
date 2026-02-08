import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthProvider';
import { chatKeys } from '../../queryKeys';
import type { MessageType, Json } from '@tcg-trade-hub/database';
import type { MessageWithSender } from '../useMessages/useMessages';
import type { InfiniteData } from '@tanstack/react-query';

type SendMessageInput = {
  conversationId: string;
  type: MessageType;
  body?: string | null;
  payload?: Json | null;
};

/** Mutation hook that inserts a message with optimistic cache update */
const useSendMessage = () => {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: SendMessageInput) => {
      if (!user) throw new Error('Must be signed in to send messages');

      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: input.conversationId,
          sender_id: user.id,
          type: input.type,
          body: input.body ?? null,
          payload: input.payload ?? null,
        })
        .select(
          `
          *,
          sender:users!messages_sender_id_fkey (
            id,
            display_name,
            avatar_url
          )
        `,
        )
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async (input) => {
      if (!user) return;

      const messagesKey = chatKeys.messages(input.conversationId);

      // Cancel any outgoing refetches for this conversation
      await queryClient.cancelQueries({ queryKey: messagesKey });

      // Snapshot the previous value
      const previousMessages =
        queryClient.getQueryData<InfiniteData<MessageWithSender[]>>(
          messagesKey,
        );

      // Optimistically add the message to the first page
      const optimisticMessage: MessageWithSender = {
        id: `optimistic-${Date.now()}`,
        conversation_id: input.conversationId,
        sender_id: user.id,
        type: input.type,
        body: input.body ?? null,
        payload: input.payload ?? null,
        created_at: new Date().toISOString(),
        sender: {
          id: user.id,
          display_name: profile?.display_name ?? 'You',
          avatar_url: profile?.avatar_url ?? null,
        },
      };

      queryClient.setQueryData<InfiniteData<MessageWithSender[]>>(
        messagesKey,
        (old) => {
          if (!old) {
            return {
              pages: [[optimisticMessage]],
              pageParams: [null],
            };
          }
          return {
            ...old,
            pages: [
              [optimisticMessage, ...(old.pages[0] ?? [])],
              ...old.pages.slice(1),
            ],
          };
        },
      );

      return { previousMessages };
    },
    onError: (_err, input, context) => {
      // Rollback on error
      if (context?.previousMessages) {
        queryClient.setQueryData(
          chatKeys.messages(input.conversationId),
          context.previousMessages,
        );
      }
    },
    onSettled: (_data, _error, input) => {
      // Refetch messages and conversations list
      queryClient.invalidateQueries({
        queryKey: chatKeys.messages(input.conversationId),
      });
      queryClient.invalidateQueries({
        queryKey: chatKeys.conversations(),
      });
    },
  });
};

export default useSendMessage;
