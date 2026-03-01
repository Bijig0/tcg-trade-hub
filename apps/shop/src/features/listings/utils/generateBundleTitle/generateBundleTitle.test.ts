import { describe, it, expect } from 'vitest';
import generateBundleTitle from './generateBundleTitle';

describe('generateBundleTitle', () => {
  it('returns empty string for no cards', () => {
    expect(generateBundleTitle([])).toBe('');
  });

  it('returns card name for single card', () => {
    expect(generateBundleTitle([{ card_name: 'Charizard VMAX' }])).toBe('Charizard VMAX');
  });

  it('returns name + 1 more for two cards', () => {
    const cards = [{ card_name: 'Charizard VMAX' }, { card_name: 'Pikachu V' }];
    expect(generateBundleTitle(cards)).toBe('Charizard VMAX + 1 more');
  });

  it('returns name + N more for multiple cards', () => {
    const cards = [{ card_name: 'Charizard' }, { card_name: 'Pikachu' }, { card_name: 'Mewtwo' }];
    expect(generateBundleTitle(cards)).toBe('Charizard + 2 more');
  });
});
