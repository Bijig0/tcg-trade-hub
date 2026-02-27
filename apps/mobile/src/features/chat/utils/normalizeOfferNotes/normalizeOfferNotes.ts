import type { CardOfferPayload, NoteEntry } from '@tcg-trade-hub/database';

type FallbackAuthor = {
  id: string;
  name: string;
  avatarUrl: string | null;
};

type NormalizedNotes = {
  offeringNotes: NoteEntry[];
  requestingNotes: NoteEntry[];
};

/**
 * Normalizes offer notes from a CardOfferPayload, handling both
 * new multi-author format (offering_notes/requesting_notes arrays)
 * and legacy single-string format (offering_note/requesting_note/note).
 *
 * When legacy strings are found, they are wrapped into single-entry
 * NoteEntry arrays using the provided fallback author info.
 */
const normalizeOfferNotes = (
  payload: CardOfferPayload,
  fallbackAuthor?: FallbackAuthor,
): NormalizedNotes => {
  // New format takes precedence
  if (payload.offering_notes || payload.requesting_notes) {
    return {
      offeringNotes: payload.offering_notes ?? [],
      requestingNotes: payload.requesting_notes ?? [],
    };
  }

  const offeringNotes: NoteEntry[] = [];
  const requestingNotes: NoteEntry[] = [];

  const legacyOfferingNote = payload.offering_note ?? payload.note;
  if (legacyOfferingNote?.trim()) {
    offeringNotes.push({
      author_id: fallbackAuthor?.id ?? 'unknown',
      author_name: fallbackAuthor?.name ?? 'Unknown',
      author_avatar_url: fallbackAuthor?.avatarUrl ?? null,
      text: legacyOfferingNote.trim(),
      created_at: new Date().toISOString(),
    });
  }

  if (payload.requesting_note?.trim()) {
    requestingNotes.push({
      author_id: fallbackAuthor?.id ?? 'unknown',
      author_name: fallbackAuthor?.name ?? 'Unknown',
      author_avatar_url: fallbackAuthor?.avatarUrl ?? null,
      text: payload.requesting_note.trim(),
      created_at: new Date().toISOString(),
    });
  }

  return { offeringNotes, requestingNotes };
};

export default normalizeOfferNotes;
