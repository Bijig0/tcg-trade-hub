import { describe, it, expect } from 'vitest';
import { deriveListingType } from './deriveListingType';

describe('deriveListingType', () => {
  it('returns wts when has cards and accepts cash only', () => {
    expect(
      deriveListingType({ hasCards: true, acceptsCash: true, acceptsTrades: false }),
    ).toBe('wts');
  });

  it('returns wtt when has cards and accepts trades only', () => {
    expect(
      deriveListingType({ hasCards: true, acceptsCash: false, acceptsTrades: true }),
    ).toBe('wtt');
  });

  it('returns wts when has cards and accepts both cash and trades', () => {
    expect(
      deriveListingType({ hasCards: true, acceptsCash: true, acceptsTrades: true }),
    ).toBe('wts');
  });

  it('returns wts when has cards but neither cash nor trades (fallback)', () => {
    expect(
      deriveListingType({ hasCards: true, acceptsCash: false, acceptsTrades: false }),
    ).toBe('wts');
  });

  it('returns wtb when no cards (want-only)', () => {
    expect(
      deriveListingType({ hasCards: false, acceptsCash: true, acceptsTrades: false }),
    ).toBe('wtb');
  });

  it('returns wtb when no cards regardless of trade flags', () => {
    expect(
      deriveListingType({ hasCards: false, acceptsCash: false, acceptsTrades: true }),
    ).toBe('wtb');
    expect(
      deriveListingType({ hasCards: false, acceptsCash: true, acceptsTrades: true }),
    ).toBe('wtb');
  });
});
