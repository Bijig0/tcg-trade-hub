import { describe, it, expect } from 'vitest';
import {
  canTransition,
  getValidTransitions,
  assertTransition,
  isTerminalStatus,
  isActionableOffer,
  isActionableListing,
  isActionableMeetup,
  LISTING_TRANSITIONS,
  OFFER_TRANSITIONS,
  MATCH_TRANSITIONS,
  MEETUP_TRANSITIONS,
  REPORT_TRANSITIONS,
} from './transitions';

// ---------------------------------------------------------------------------
// canTransition
// ---------------------------------------------------------------------------

describe('canTransition', () => {
  describe('listing', () => {
    it('allows active → matched', () => {
      expect(canTransition('listing', 'active', 'matched')).toBe(true);
    });

    it('allows active → expired', () => {
      expect(canTransition('listing', 'active', 'expired')).toBe(true);
    });

    it('allows matched → completed', () => {
      expect(canTransition('listing', 'matched', 'completed')).toBe(true);
    });

    it('rejects completed → active (terminal)', () => {
      expect(canTransition('listing', 'completed', 'active')).toBe(false);
    });

    it('rejects active → completed (skipping matched)', () => {
      expect(canTransition('listing', 'active', 'completed')).toBe(false);
    });

    it('rejects expired → active (terminal)', () => {
      expect(canTransition('listing', 'expired', 'active')).toBe(false);
    });
  });

  describe('offer', () => {
    it('allows pending → accepted', () => {
      expect(canTransition('offer', 'pending', 'accepted')).toBe(true);
    });

    it('allows pending → declined', () => {
      expect(canTransition('offer', 'pending', 'declined')).toBe(true);
    });

    it('allows pending → countered', () => {
      expect(canTransition('offer', 'pending', 'countered')).toBe(true);
    });

    it('allows pending → withdrawn', () => {
      expect(canTransition('offer', 'pending', 'withdrawn')).toBe(true);
    });

    it('allows countered → accepted', () => {
      expect(canTransition('offer', 'countered', 'accepted')).toBe(true);
    });

    it('allows countered → declined', () => {
      expect(canTransition('offer', 'countered', 'declined')).toBe(true);
    });

    it('allows countered → withdrawn', () => {
      expect(canTransition('offer', 'countered', 'withdrawn')).toBe(true);
    });

    it('rejects accepted → pending (terminal)', () => {
      expect(canTransition('offer', 'accepted', 'pending')).toBe(false);
    });

    it('rejects declined → accepted (terminal)', () => {
      expect(canTransition('offer', 'declined', 'accepted')).toBe(false);
    });

    it('rejects withdrawn → pending (terminal)', () => {
      expect(canTransition('offer', 'withdrawn', 'pending')).toBe(false);
    });
  });

  describe('match', () => {
    it('allows active → completed', () => {
      expect(canTransition('match', 'active', 'completed')).toBe(true);
    });

    it('allows active → cancelled', () => {
      expect(canTransition('match', 'active', 'cancelled')).toBe(true);
    });

    it('rejects completed → active (terminal)', () => {
      expect(canTransition('match', 'completed', 'active')).toBe(false);
    });

    it('rejects cancelled → active (terminal)', () => {
      expect(canTransition('match', 'cancelled', 'active')).toBe(false);
    });
  });

  describe('meetup', () => {
    it('allows confirmed → completed', () => {
      expect(canTransition('meetup', 'confirmed', 'completed')).toBe(true);
    });

    it('allows confirmed → cancelled', () => {
      expect(canTransition('meetup', 'confirmed', 'cancelled')).toBe(true);
    });

    it('rejects completed → confirmed (terminal)', () => {
      expect(canTransition('meetup', 'completed', 'confirmed')).toBe(false);
    });

    it('rejects cancelled → confirmed (terminal)', () => {
      expect(canTransition('meetup', 'cancelled', 'confirmed')).toBe(false);
    });
  });

  describe('report', () => {
    it('allows pending → reviewed', () => {
      expect(canTransition('report', 'pending', 'reviewed')).toBe(true);
    });

    it('allows reviewed → resolved', () => {
      expect(canTransition('report', 'reviewed', 'resolved')).toBe(true);
    });

    it('rejects pending → resolved (skipping reviewed)', () => {
      expect(canTransition('report', 'pending', 'resolved')).toBe(false);
    });

    it('rejects resolved → pending (terminal)', () => {
      expect(canTransition('report', 'resolved', 'pending')).toBe(false);
    });
  });
});

// ---------------------------------------------------------------------------
// getValidTransitions
// ---------------------------------------------------------------------------

describe('getValidTransitions', () => {
  it('returns valid targets for active listing', () => {
    expect(getValidTransitions('listing', 'active')).toEqual(['matched', 'expired']);
  });

  it('returns empty array for terminal status', () => {
    expect(getValidTransitions('offer', 'declined')).toEqual([]);
  });

  it('returns all pending offer options', () => {
    expect(getValidTransitions('offer', 'pending')).toEqual([
      'accepted',
      'declined',
      'countered',
      'withdrawn',
    ]);
  });
});

// ---------------------------------------------------------------------------
// assertTransition
// ---------------------------------------------------------------------------

describe('assertTransition', () => {
  it('does not throw for valid transition', () => {
    expect(() => assertTransition('listing', 'active', 'matched')).not.toThrow();
  });

  it('throws with descriptive message for invalid transition', () => {
    expect(() => assertTransition('offer', 'declined', 'accepted')).toThrow(
      'Invalid offer status transition: "declined" → "accepted". "declined" is a terminal status',
    );
  });

  it('throws with valid alternatives for non-terminal invalid transition', () => {
    expect(() => assertTransition('listing', 'active', 'completed')).toThrow(
      'Valid transitions from "active": matched, expired.',
    );
  });
});

// ---------------------------------------------------------------------------
// isTerminalStatus
// ---------------------------------------------------------------------------

describe('isTerminalStatus', () => {
  it('returns true for terminal listing statuses', () => {
    expect(isTerminalStatus('listing', 'completed')).toBe(true);
    expect(isTerminalStatus('listing', 'expired')).toBe(true);
  });

  it('returns false for non-terminal listing statuses', () => {
    expect(isTerminalStatus('listing', 'active')).toBe(false);
    expect(isTerminalStatus('listing', 'matched')).toBe(false);
  });

  it('returns true for all terminal offer statuses', () => {
    expect(isTerminalStatus('offer', 'accepted')).toBe(true);
    expect(isTerminalStatus('offer', 'declined')).toBe(true);
    expect(isTerminalStatus('offer', 'withdrawn')).toBe(true);
  });

  it('returns false for actionable offer statuses', () => {
    expect(isTerminalStatus('offer', 'pending')).toBe(false);
    expect(isTerminalStatus('offer', 'countered')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Type guards
// ---------------------------------------------------------------------------

describe('isActionableOffer', () => {
  it('returns true for pending and countered', () => {
    expect(isActionableOffer('pending')).toBe(true);
    expect(isActionableOffer('countered')).toBe(true);
  });

  it('returns false for terminal statuses', () => {
    expect(isActionableOffer('accepted')).toBe(false);
    expect(isActionableOffer('declined')).toBe(false);
    expect(isActionableOffer('withdrawn')).toBe(false);
  });
});

describe('isActionableListing', () => {
  it('returns true for active and matched', () => {
    expect(isActionableListing('active')).toBe(true);
    expect(isActionableListing('matched')).toBe(true);
  });

  it('returns false for terminal statuses', () => {
    expect(isActionableListing('completed')).toBe(false);
    expect(isActionableListing('expired')).toBe(false);
  });
});

describe('isActionableMeetup', () => {
  it('returns true for proposed and confirmed', () => {
    expect(isActionableMeetup('proposed')).toBe(true);
    expect(isActionableMeetup('confirmed')).toBe(true);
  });

  it('returns false for terminal statuses', () => {
    expect(isActionableMeetup('completed')).toBe(false);
    expect(isActionableMeetup('cancelled')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Transition map completeness checks
// ---------------------------------------------------------------------------

describe('transition map completeness', () => {
  it('LISTING_TRANSITIONS covers all ListingStatus values', () => {
    const statuses: readonly string[] = ['active', 'matched', 'completed', 'expired'];
    expect(Object.keys(LISTING_TRANSITIONS).sort()).toEqual([...statuses].sort());
  });

  it('OFFER_TRANSITIONS covers all OfferStatus values', () => {
    const statuses: readonly string[] = ['pending', 'accepted', 'declined', 'countered', 'withdrawn'];
    expect(Object.keys(OFFER_TRANSITIONS).sort()).toEqual([...statuses].sort());
  });

  it('MATCH_TRANSITIONS covers all MatchStatus values', () => {
    const statuses: readonly string[] = ['active', 'completed', 'cancelled'];
    expect(Object.keys(MATCH_TRANSITIONS).sort()).toEqual([...statuses].sort());
  });

  it('MEETUP_TRANSITIONS covers all MeetupStatus values', () => {
    const statuses: readonly string[] = ['proposed', 'confirmed', 'completed', 'cancelled'];
    expect(Object.keys(MEETUP_TRANSITIONS).sort()).toEqual([...statuses].sort());
  });

  it('REPORT_TRANSITIONS covers all ReportStatus values', () => {
    const statuses: readonly string[] = ['pending', 'reviewed', 'resolved'];
    expect(Object.keys(REPORT_TRANSITIONS).sort()).toEqual([...statuses].sort());
  });
});
