import { describe, it, expect } from 'vitest';
import parseOfferPayload from './parseOfferPayload';

const makeCardRef = (name: string) => ({
  externalId: `ext-${name.toLowerCase().replace(/\s/g, '-')}`,
  tcg: 'pokemon',
  name,
  imageUrl: `https://example.com/${name.toLowerCase().replace(/\s/g, '-')}.png`,
});

const validPayload = {
  offering: [makeCardRef('Charizard VMAX')],
  requesting: [makeCardRef('Pikachu V')],
  cash_amount: 20,
  cash_direction: 'offering' as const,
  note: 'Would you consider this trade?',
};

describe('parseOfferPayload', () => {
  it('should parse a valid offer payload', () => {
    const result = parseOfferPayload(validPayload);
    expect(result).not.toBeNull();
    expect(result!.offeringCount).toBe(1);
    expect(result!.requestingCount).toBe(1);
    expect(result!.cashAmount).toBe(20);
    expect(result!.cashDirection).toBe('offering');
    expect(result!.note).toBe('Would you consider this trade?');
    expect(result!.isTradeOnly).toBe(false);
  });

  it('should detect trade-only offers (no cash)', () => {
    const tradeOnly = {
      ...validPayload,
      cash_amount: undefined,
      cash_direction: undefined,
    };
    const result = parseOfferPayload(tradeOnly);
    expect(result).not.toBeNull();
    expect(result!.isTradeOnly).toBe(true);
    expect(result!.cashAmount).toBeNull();
  });

  it('should return null for invalid payload', () => {
    expect(parseOfferPayload(null)).toBeNull();
    expect(parseOfferPayload({})).toBeNull();
    expect(parseOfferPayload('invalid')).toBeNull();
  });

  it('should handle offers without a note', () => {
    const noNote = {
      ...validPayload,
      note: undefined,
    };
    const result = parseOfferPayload(noNote);
    expect(result).not.toBeNull();
    expect(result!.note).toBeNull();
  });

  it('should count multiple cards correctly', () => {
    const multiCard = {
      ...validPayload,
      offering: [
        makeCardRef('Card A'),
        makeCardRef('Card B'),
        makeCardRef('Card C'),
      ],
    };
    const result = parseOfferPayload(multiCard);
    expect(result).not.toBeNull();
    expect(result!.offeringCount).toBe(3);
  });
});
