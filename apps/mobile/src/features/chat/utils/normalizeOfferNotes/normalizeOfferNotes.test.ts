import { describe, it, expect } from 'vitest';
import normalizeOfferNotes from './normalizeOfferNotes';
import type { CardOfferPayload, NoteEntry } from '@tcg-trade-hub/database';

const FALLBACK_AUTHOR = {
  id: 'user-1',
  name: 'Alice',
  avatarUrl: 'https://example.com/alice.png',
};

const makePayload = (overrides: Partial<CardOfferPayload> = {}): CardOfferPayload => ({
  offering: [],
  requesting: [],
  ...overrides,
});

const makeNote = (overrides: Partial<NoteEntry> = {}): NoteEntry => ({
  author_id: 'user-1',
  author_name: 'Alice',
  author_avatar_url: null,
  text: 'NM cards',
  created_at: '2026-01-01T00:00:00.000Z',
  ...overrides,
});

describe('normalizeOfferNotes', () => {
  it('returns empty arrays when no notes exist', () => {
    const result = normalizeOfferNotes(makePayload());
    expect(result.offeringNotes).toEqual([]);
    expect(result.requestingNotes).toEqual([]);
  });

  it('returns new-format arrays when offering_notes is present', () => {
    const notes = [makeNote({ text: 'Note 1' }), makeNote({ text: 'Note 2' })];
    const result = normalizeOfferNotes(
      makePayload({ offering_notes: notes }),
    );
    expect(result.offeringNotes).toEqual(notes);
    expect(result.requestingNotes).toEqual([]);
  });

  it('returns new-format arrays when requesting_notes is present', () => {
    const notes = [makeNote({ text: 'Requesting note' })];
    const result = normalizeOfferNotes(
      makePayload({ requesting_notes: notes }),
    );
    expect(result.offeringNotes).toEqual([]);
    expect(result.requestingNotes).toEqual(notes);
  });

  it('prefers new format over legacy strings', () => {
    const notes = [makeNote({ text: 'New format' })];
    const result = normalizeOfferNotes(
      makePayload({
        offering_notes: notes,
        offering_note: 'Legacy string (should be ignored)',
      }),
    );
    expect(result.offeringNotes).toEqual(notes);
  });

  it('converts legacy offering_note to single-entry array', () => {
    const result = normalizeOfferNotes(
      makePayload({ offering_note: 'Cards are NM' }),
      FALLBACK_AUTHOR,
    );
    expect(result.offeringNotes).toHaveLength(1);
    expect(result.offeringNotes[0]!.text).toBe('Cards are NM');
    expect(result.offeringNotes[0]!.author_id).toBe('user-1');
    expect(result.offeringNotes[0]!.author_name).toBe('Alice');
    expect(result.offeringNotes[0]!.author_avatar_url).toBe('https://example.com/alice.png');
  });

  it('converts legacy requesting_note to single-entry array', () => {
    const result = normalizeOfferNotes(
      makePayload({ requesting_note: 'Looking for LP+' }),
      FALLBACK_AUTHOR,
    );
    expect(result.requestingNotes).toHaveLength(1);
    expect(result.requestingNotes[0]!.text).toBe('Looking for LP+');
  });

  it('falls back to deprecated note field for offering side', () => {
    const result = normalizeOfferNotes(
      makePayload({ note: 'Old style note' }),
      FALLBACK_AUTHOR,
    );
    expect(result.offeringNotes).toHaveLength(1);
    expect(result.offeringNotes[0]!.text).toBe('Old style note');
    expect(result.requestingNotes).toEqual([]);
  });

  it('prefers offering_note over deprecated note', () => {
    const result = normalizeOfferNotes(
      makePayload({ offering_note: 'Newer', note: 'Older' }),
      FALLBACK_AUTHOR,
    );
    expect(result.offeringNotes).toHaveLength(1);
    expect(result.offeringNotes[0]!.text).toBe('Newer');
  });

  it('trims whitespace from legacy notes', () => {
    const result = normalizeOfferNotes(
      makePayload({ offering_note: '  Trimmed  ' }),
      FALLBACK_AUTHOR,
    );
    expect(result.offeringNotes[0]!.text).toBe('Trimmed');
  });

  it('ignores empty/whitespace-only legacy notes', () => {
    const result = normalizeOfferNotes(
      makePayload({ offering_note: '   ', requesting_note: '' }),
      FALLBACK_AUTHOR,
    );
    expect(result.offeringNotes).toEqual([]);
    expect(result.requestingNotes).toEqual([]);
  });

  it('uses "unknown" fallback when no author provided', () => {
    const result = normalizeOfferNotes(
      makePayload({ offering_note: 'No author' }),
    );
    expect(result.offeringNotes[0]!.author_id).toBe('unknown');
    expect(result.offeringNotes[0]!.author_name).toBe('Unknown');
    expect(result.offeringNotes[0]!.author_avatar_url).toBeNull();
  });
});
