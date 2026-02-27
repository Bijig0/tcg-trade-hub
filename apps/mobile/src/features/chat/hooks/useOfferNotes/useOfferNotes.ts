import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { chatKeys } from '../../queryKeys';
import normalizeOfferNotes from '../../utils/normalizeOfferNotes/normalizeOfferNotes';
import type { CardOfferPayload, NoteEntry } from '@tcg-trade-hub/database';

type OfferNotes = {
  offeringNotes: NoteEntry[];
  requestingNotes: NoteEntry[];
};

/**
 * Fetches notes from the most recent card_offer message in a conversation.
 * Handles both new multi-author format and legacy single-string format.
 */
const useOfferNotes = (conversationId: string) => {
  return useQuery({
    queryKey: chatKeys.offerNotes(conversationId),
    queryFn: async (): Promise<OfferNotes> => {
      const { data, error } = await supabase
        .from('messages')
        .select(
          `
          id,
          payload,
          sender:users!messages_sender_id_fkey (
            id,
            display_name,
            avatar_url
          )
        `,
        )
        .eq('conversation_id', conversationId)
        .eq('type', 'card_offer')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;
      if (!data || data.length === 0) {
        return { offeringNotes: [], requestingNotes: [] };
      }

      const msg = data[0]!;
      const payload = msg.payload as CardOfferPayload;
      const sender = msg.sender as unknown as {
        id: string;
        display_name: string;
        avatar_url: string | null;
      };

      return normalizeOfferNotes(payload, {
        id: sender.id,
        name: sender.display_name,
        avatarUrl: sender.avatar_url,
      });
    },
    enabled: !!conversationId,
    staleTime: 5 * 60 * 1000,
  });
};

export default useOfferNotes;
