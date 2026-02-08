import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthProvider';
import { chatKeys } from '../../queryKeys';
import type { MessageType } from '@tcg-trade-hub/database';

export type ConversationPreview = {
  conversationId: string;
  matchId: string;
  otherUser: {
    id: string;
    name: string;
    avatar: string | null;
    rating: number;
  };
  lastMessage: {
    body: string | null;
    type: MessageType;
    createdAt: string;
  } | null;
  unreadCount: number;
};

/** Fetches all conversations for the current user, sorted by most recent message */
const useConversations = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: chatKeys.conversations(),
    queryFn: async (): Promise<ConversationPreview[]> => {
      if (!user) return [];

      // Get conversations where the current user is part of the match
      const { data: conversations, error } = await supabase
        .from('conversations')
        .select(
          `
          id,
          match_id,
          matches!inner (
            id,
            user_a_id,
            user_b_id
          )
        `,
        )
        .or(
          `matches.user_a_id.eq.${user.id},matches.user_b_id.eq.${user.id}`,
        );

      if (error) throw error;
      if (!conversations || conversations.length === 0) return [];

      const results: ConversationPreview[] = [];

      for (const conv of conversations) {
        const match = conv.matches as unknown as {
          id: string;
          user_a_id: string;
          user_b_id: string;
        };

        const otherUserId =
          match.user_a_id === user.id ? match.user_b_id : match.user_a_id;

        // Fetch the other user's profile
        const { data: otherUserData } = await supabase
          .from('users')
          .select('id, display_name, avatar_url, rating_score')
          .eq('id', otherUserId)
          .single();

        // Fetch the last message
        const { data: lastMessageData } = await supabase
          .from('messages')
          .select('body, type, created_at')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        results.push({
          conversationId: conv.id,
          matchId: match.id,
          otherUser: {
            id: otherUserData?.id ?? otherUserId,
            name: otherUserData?.display_name ?? 'Unknown',
            avatar: otherUserData?.avatar_url ?? null,
            rating: otherUserData?.rating_score ?? 0,
          },
          lastMessage: lastMessageData
            ? {
                body: lastMessageData.body,
                type: lastMessageData.type,
                createdAt: lastMessageData.created_at,
              }
            : null,
          unreadCount: 0, // Placeholder until read receipts are implemented
        });
      }

      // Sort by last message date descending (newest first)
      results.sort((a, b) => {
        const dateA = a.lastMessage?.createdAt ?? '';
        const dateB = b.lastMessage?.createdAt ?? '';
        return dateB.localeCompare(dateA);
      });

      return results;
    },
    enabled: !!user,
  });
};

export default useConversations;
