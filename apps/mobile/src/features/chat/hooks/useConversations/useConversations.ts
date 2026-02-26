import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthProvider';
import { chatKeys } from '../../queryKeys';
import type { MessageType, NegotiationStatus } from '@tcg-trade-hub/database';

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
  negotiationStatus: NegotiationStatus;
  listingTitle: string;
  listingThumbnails: string[];
  nickname: string | null;
};

/**
 * Fetches all conversations for a given user, sorted by most recent message.
 *
 * Batch-fetches profiles, last messages, and unread counts in bulk queries
 * instead of N+1 loops. Filters out conversations with blocked users.
 */
export const fetchConversations = async (userId: string): Promise<ConversationPreview[]> => {
  // 1. Get conversations with match data, listing info, and negotiation status
  const { data: conversations, error } = await supabase
    .from('conversations')
    .select(
      `
      id,
      match_id,
      negotiation_status,
      matches!inner (
        id,
        user_a_id,
        user_b_id,
        listing_id,
        listings!inner (
          id,
          title,
          type,
          tcg,
          listing_items (
            card_image_url
          )
        )
      )
    `,
    )
    .or(
      `user_a_id.eq.${userId},user_b_id.eq.${userId}`,
      { referencedTable: 'matches' },
    );

  if (error) throw error;
  if (!conversations || conversations.length === 0) return [];

  // 2. Collect other user IDs and conversation IDs
  const otherUserIds: string[] = [];
  const convIds: string[] = [];

  for (const conv of conversations) {
    const match = conv.matches as unknown as {
      id: string;
      user_a_id: string;
      user_b_id: string;
      listing_id: string;
      listings: {
        id: string;
        title: string;
        type: string;
        tcg: string;
        listing_items: Array<{ card_image_url: string }>;
      };
    };
    const otherId =
      match.user_a_id === userId ? match.user_b_id : match.user_a_id;
    otherUserIds.push(otherId);
    convIds.push(conv.id);
  }

  // 3. Fetch blocked user IDs (both directions)
  const { data: blocksAsBlocker } = await supabase
    .from('blocks')
    .select('blocked_id')
    .eq('blocker_id', userId);

  const { data: blocksAsBlocked } = await supabase
    .from('blocks')
    .select('blocker_id')
    .eq('blocked_id', userId);

  const blockedIds = new Set<string>([
    ...(blocksAsBlocker ?? []).map((b) => b.blocked_id),
    ...(blocksAsBlocked ?? []).map((b) => b.blocker_id),
  ]);

  // 4. Batch fetch profiles for all other users
  const uniqueOtherIds = [...new Set(otherUserIds)];
  const { data: profiles } = await supabase
    .from('users')
    .select('id, display_name, avatar_url, rating_score')
    .in('id', uniqueOtherIds);

  const profileMap = new Map(
    (profiles ?? []).map((p) => [p.id, p]),
  );

  // 5. Batch fetch last messages — one query, most recent per conversation
  const { data: recentMessages } = await supabase
    .from('messages')
    .select('conversation_id, body, type, created_at')
    .in('conversation_id', convIds)
    .order('created_at', { ascending: false });

  // Deduplicate to most recent per conversation
  const lastMessageMap = new Map<
    string,
    { body: string | null; type: MessageType; created_at: string }
  >();
  for (const msg of recentMessages ?? []) {
    if (!lastMessageMap.has(msg.conversation_id)) {
      lastMessageMap.set(msg.conversation_id, {
        body: msg.body,
        type: msg.type as MessageType,
        created_at: msg.created_at,
      });
    }
  }

  // 6. Get real unread counts via RPC
  const { data: unreadData } = await supabase.rpc('get_unread_counts', {
    p_user_id: userId,
  });

  const unreadMap = new Map<string, number>(
    (unreadData ?? []).map((r: { conversation_id: string; unread_count: number }) => [
      r.conversation_id,
      r.unread_count,
    ]),
  );

  // 6b. Bulk-fetch nicknames for current user
  const { data: nicknameData } = await supabase
    .from('conversation_nicknames')
    .select('conversation_id, nickname')
    .eq('user_id', userId)
    .in('conversation_id', convIds);

  const nicknameMap = new Map<string, string>(
    (nicknameData ?? []).map((n) => [n.conversation_id, n.nickname]),
  );

  // 7. Build results, filtering blocked users
  const results: ConversationPreview[] = [];

  for (const conv of conversations) {
    const match = conv.matches as unknown as {
      id: string;
      user_a_id: string;
      user_b_id: string;
      listing_id: string;
      listings: {
        id: string;
        title: string;
        type: string;
        tcg: string;
        listing_items: Array<{ card_image_url: string }>;
      };
    };

    const otherId =
      match.user_a_id === userId ? match.user_b_id : match.user_a_id;

    // Filter blocked users
    if (blockedIds.has(otherId)) continue;

    const profile = profileMap.get(otherId);
    const lastMsg = lastMessageMap.get(conv.id);

    // Get first 2 card thumbnails from listing items
    const listingThumbnails = (match.listings.listing_items ?? [])
      .slice(0, 2)
      .map((li) => li.card_image_url);

    results.push({
      conversationId: conv.id,
      matchId: match.id,
      otherUser: {
        id: profile?.id ?? otherId,
        name: profile?.display_name ?? 'Unknown',
        avatar: profile?.avatar_url ?? null,
        rating: profile?.rating_score ?? 0,
      },
      lastMessage: lastMsg
        ? {
            body: lastMsg.body,
            type: lastMsg.type,
            createdAt: lastMsg.created_at,
          }
        : null,
      unreadCount: unreadMap.get(conv.id) ?? 0,
      negotiationStatus: conv.negotiation_status as NegotiationStatus,
      listingTitle: match.listings.title,
      listingThumbnails,
      nickname: nicknameMap.get(conv.id) ?? null,
    });
  }

  // Sort by last message date descending (newest first)
  results.sort((a, b) => {
    const dateA = a.lastMessage?.createdAt ?? '';
    const dateB = b.lastMessage?.createdAt ?? '';
    return dateB.localeCompare(dateA);
  });

  return results;
};

/**
 * Hook that fetches all conversations for the current user.
 */
const useConversations = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: chatKeys.conversations(),
    queryFn: () => fetchConversations(user!.id),
    enabled: !!user,
  });
};

export default useConversations;
