import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { chatKeys } from '../../queryKeys';
import type { MessageRow, UserRow } from '@tcg-trade-hub/database';

const PAGE_SIZE = 30;

export type MessageWithSender = MessageRow & {
  sender: Pick<UserRow, 'id' | 'display_name' | 'avatar_url'>;
};

/** Fetches paginated messages for a conversation in reverse chronological order */
const useMessages = (conversationId: string) => {
  return useInfiniteQuery({
    queryKey: chatKeys.messages(conversationId),
    queryFn: async ({ pageParam }): Promise<MessageWithSender[]> => {
      let query = supabase
        .from('messages')
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
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .limit(PAGE_SIZE);

      if (pageParam) {
        query = query.lt('created_at', pageParam);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data ?? []).map((msg) => ({
        ...msg,
        sender: msg.sender as unknown as Pick<
          UserRow,
          'id' | 'display_name' | 'avatar_url'
        >,
      }));
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => {
      if (lastPage.length < PAGE_SIZE) return undefined;
      return lastPage[lastPage.length - 1]?.created_at ?? undefined;
    },
    enabled: !!conversationId,
  });
};

export default useMessages;
