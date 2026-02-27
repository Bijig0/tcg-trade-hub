import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { chatKeys } from '../../queryKeys';
import normalizeOfferNotes from '../../utils/normalizeOfferNotes/normalizeOfferNotes';
import type { CardOfferPayload, NoteEntry } from '@tcg-trade-hub/database';

export type PreviousOffer = {
  offering: CardOfferPayload['offering'];
  requesting: CardOfferPayload['requesting'];
  cashAmount: number;
  cashDirection: 'offering' | 'requesting' | null;
  offeringNote: string | null;
  requestingNote: string | null;
  offeringNotes: NoteEntry[];
  requestingNotes: NoteEntry[];
  senderDisplayName: string;
  sentAt: string;
};

/**
 * Fetches the previous (second-most-recent) card_offer message for a conversation.
 * Returns null when there's only one offer (i.e. the current active offer is the first).
 */
const usePreviousOffer = (conversationId: string) => {
  return useQuery({
    queryKey: chatKeys.previousOffer(conversationId),
    queryFn: async (): Promise<PreviousOffer | null> => {
      const { data, error } = await supabase
        .from('messages')
        .select(
          `
          id,
          payload,
          created_at,
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
        .limit(2);

      if (error) throw error;
      if (!data || data.length < 2) return null;

      // Index 0 = most recent (current active offer), index 1 = previous offer
      const prev = data[1]!;
      const payload = prev.payload as CardOfferPayload;
      const sender = prev.sender as unknown as {
        id: string;
        display_name: string;
        avatar_url: string | null;
      };

      const normalized = normalizeOfferNotes(payload, {
        id: sender.id,
        name: sender.display_name,
        avatarUrl: sender.avatar_url,
      });

      return {
        offering: payload.offering ?? [],
        requesting: payload.requesting ?? [],
        cashAmount: payload.cash_amount ?? 0,
        cashDirection: payload.cash_direction ?? null,
        offeringNote: payload.offering_note ?? payload.note ?? null,
        requestingNote: payload.requesting_note ?? null,
        offeringNotes: normalized.offeringNotes,
        requestingNotes: normalized.requestingNotes,
        senderDisplayName: sender.display_name,
        sentAt: prev.created_at,
      };
    },
    enabled: !!conversationId,
    staleTime: 5 * 60 * 1000,
  });
};

export default usePreviousOffer;
