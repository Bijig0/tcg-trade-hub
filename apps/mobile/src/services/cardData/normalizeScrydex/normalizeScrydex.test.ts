import { describe, it, expect } from 'vitest';
import {
  extractScrydexImage,
  extractScrydexLargeImage,
  extractScrydexMarketPrice,
  normalizeScrydexCard,
  normalizeScrydexCardDetail,
  buildPriceData,
  buildPriceHistory,
  getScrydexTcgPath,
  type ScrydexCard,
} from './normalizeScrydex';

const MOCK_CARD: ScrydexCard = {
  id: 'sv3pt5-199',
  name: 'Charizard ex',
  number: '199',
  rarity: 'Special Art Rare',
  images: [
    { small: 'https://img.scrydex.com/s.jpg', medium: 'https://img.scrydex.com/m.jpg', large: 'https://img.scrydex.com/l.jpg' },
  ],
  expansion: { name: '151', code: 'sv3pt5' },
  prices: [
    { variant: 'normal', low: 150, mid: 175, high: 210, market: 185 },
    { variant: 'holofoil', low: 200, mid: 240, high: 300, market: 250 },
  ],
  trends: [
    { date: '2025-01-01', price: 170 },
    { date: '2025-02-01', price: 180 },
    { date: '2025-03-01', price: 185 },
  ],
  artist: 'Mitsuhiro Arita',
  types: ['Fire'],
  hp: '330',
};

describe('getScrydexTcgPath', () => {
  it('maps pokemon correctly', () => {
    expect(getScrydexTcgPath('pokemon')).toBe('pokemon');
  });

  it('maps mtg to magicthegathering', () => {
    expect(getScrydexTcgPath('mtg')).toBe('magicthegathering');
  });

  it('maps onepiece correctly', () => {
    expect(getScrydexTcgPath('onepiece')).toBe('onepiece');
  });

  it('returns the tcg as-is for unknown values', () => {
    expect(getScrydexTcgPath('lorcana')).toBe('lorcana');
  });
});

describe('extractScrydexImage', () => {
  it('returns medium image by preference', () => {
    expect(extractScrydexImage(MOCK_CARD.images)).toBe('https://img.scrydex.com/m.jpg');
  });

  it('falls back to small when medium is missing', () => {
    expect(extractScrydexImage([{ small: 'https://s.jpg' }])).toBe('https://s.jpg');
  });

  it('returns empty string for empty array', () => {
    expect(extractScrydexImage([])).toBe('');
  });

  it('returns empty string for undefined', () => {
    expect(extractScrydexImage(undefined)).toBe('');
  });
});

describe('extractScrydexLargeImage', () => {
  it('returns large image by preference', () => {
    expect(extractScrydexLargeImage(MOCK_CARD.images)).toBe('https://img.scrydex.com/l.jpg');
  });

  it('falls back to medium when large is missing', () => {
    expect(extractScrydexLargeImage([{ medium: 'https://m.jpg' }])).toBe('https://m.jpg');
  });
});

describe('extractScrydexMarketPrice', () => {
  it('returns the normal variant market price', () => {
    expect(extractScrydexMarketPrice(MOCK_CARD.prices)).toBe(185);
  });

  it('falls back to first variant if no normal variant', () => {
    expect(extractScrydexMarketPrice([{ variant: 'holofoil', market: 250 }])).toBe(250);
  });

  it('returns null for empty prices', () => {
    expect(extractScrydexMarketPrice([])).toBeNull();
  });

  it('returns null for undefined', () => {
    expect(extractScrydexMarketPrice(undefined)).toBeNull();
  });
});

describe('normalizeScrydexCard', () => {
  it('normalizes a full card correctly', () => {
    const result = normalizeScrydexCard(MOCK_CARD, 'pokemon');

    expect(result).toEqual({
      externalId: 'sv3pt5-199',
      tcg: 'pokemon',
      name: 'Charizard ex',
      setName: '151',
      setCode: 'sv3pt5',
      number: '199',
      imageUrl: 'https://img.scrydex.com/m.jpg',
      marketPrice: 185,
      rarity: 'Special Art Rare',
    });
  });

  it('handles missing expansion', () => {
    const card: ScrydexCard = { ...MOCK_CARD, expansion: undefined };
    const result = normalizeScrydexCard(card, 'mtg');
    expect(result.setName).toBe('Unknown Set');
    expect(result.setCode).toBe('N/A');
  });

  it('handles missing images', () => {
    const card: ScrydexCard = { ...MOCK_CARD, images: undefined };
    const result = normalizeScrydexCard(card, 'pokemon');
    expect(result.imageUrl).toBe('');
  });
});

describe('buildPriceData', () => {
  it('builds variants from price array', () => {
    const result = buildPriceData(MOCK_CARD.prices);
    expect(result).not.toBeNull();
    expect(result!.variants.normal.market).toBe(185);
    expect(result!.variants.holofoil.market).toBe(250);
    expect(result!.averageSellPrice).toBe(185);
  });

  it('returns null for empty prices', () => {
    expect(buildPriceData([])).toBeNull();
  });
});

describe('buildPriceHistory', () => {
  it('builds history with stats', () => {
    const result = buildPriceHistory(MOCK_CARD.trends);
    expect(result).not.toBeNull();
    expect(result!.points).toHaveLength(3);
    expect(result!.high).toBe(185);
    expect(result!.low).toBe(170);
    expect(result!.changePercent).toBeCloseTo(8.82, 1);
  });

  it('returns null for empty trends', () => {
    expect(buildPriceHistory([])).toBeNull();
  });
});

describe('normalizeScrydexCardDetail', () => {
  it('includes all CardDetail fields', () => {
    const result = normalizeScrydexCardDetail(MOCK_CARD, 'pokemon');

    expect(result.externalId).toBe('sv3pt5-199');
    expect(result.largeImageUrl).toBe('https://img.scrydex.com/l.jpg');
    expect(result.artist).toBe('Mitsuhiro Arita');
    expect(result.types).toEqual(['Fire']);
    expect(result.hp).toBe('330');
    expect(result.prices).not.toBeNull();
    expect(result.priceHistory).not.toBeNull();
  });

  it('handles one piece card with ink_types', () => {
    const opCard: ScrydexCard = {
      id: 'op05-119',
      name: 'Monkey.D.Luffy',
      number: '119',
      rarity: 'Secret Rare',
      ink_types: ['Red', 'Green'],
    };
    const result = normalizeScrydexCardDetail(opCard, 'onepiece');
    expect(result.types).toEqual(['Red', 'Green']);
  });
});
