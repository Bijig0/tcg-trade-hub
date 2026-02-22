import { describe, it, expect } from 'vitest';
import generateBundleTitle from './generateBundleTitle';
import type { SelectedCard } from '../../schemas';

const makeCard = (name: string): SelectedCard => ({
  card: {
    externalId: `ext-${name}`,
    tcg: 'pokemon',
    name,
    setName: 'Test Set',
    setCode: 'TST',
    number: '001',
    imageUrl: 'https://example.com/img.png',
    marketPrice: 10,
    rarity: 'Common',
  },
  condition: 'nm',
  fromCollection: true,
  addToCollection: false,
  askingPrice: '',
});

describe('generateBundleTitle', () => {
  it('returns empty string for no cards', () => {
    expect(generateBundleTitle([])).toBe('');
  });

  it('returns card name for single card', () => {
    expect(generateBundleTitle([makeCard('Charizard VMAX')])).toBe('Charizard VMAX');
  });

  it('returns name + 1 more for two cards', () => {
    const cards = [makeCard('Charizard VMAX'), makeCard('Pikachu V')];
    expect(generateBundleTitle(cards)).toBe('Charizard VMAX + 1 more');
  });

  it('returns name + N more for multiple cards', () => {
    const cards = [makeCard('Charizard'), makeCard('Pikachu'), makeCard('Mewtwo')];
    expect(generateBundleTitle(cards)).toBe('Charizard + 2 more');
  });
});
