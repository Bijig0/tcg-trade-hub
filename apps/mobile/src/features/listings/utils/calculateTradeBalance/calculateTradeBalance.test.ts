import { describe, it, expect } from 'vitest';
import calculateTradeBalance from './calculateTradeBalance';
import type { SelectedCard, WantedCard } from '../../schemas';
import type { NormalizedCard } from '@tcg-trade-hub/database';

const makeCard = (overrides: Partial<NormalizedCard> = {}): NormalizedCard => ({
  externalId: 'test-1',
  tcg: 'pokemon',
  name: 'Test Card',
  setName: 'Test Set',
  setCode: 'TST',
  number: '1',
  imageUrl: 'https://example.com/card.png',
  marketPrice: null,
  rarity: 'Common',
  ...overrides,
});

const makeSelected = (marketPrice: number | null, overrides: Partial<SelectedCard> = {}): SelectedCard => ({
  card: makeCard({ marketPrice }),
  condition: 'nm',
  fromCollection: true,
  addToCollection: false,
  askingPrice: '',
  ...overrides,
});

const makeWanted = (marketPrice: number | null): WantedCard => ({
  card: makeCard({ marketPrice }),
});

describe('calculateTradeBalance', () => {
  it('should return zeros for empty arrays', () => {
    const result = calculateTradeBalance([], []);
    expect(result.offerTotal).toBe(0);
    expect(result.wantTotal).toBe(0);
    expect(result.differencePercent).toBe(0);
    expect(result.fairness).toBe('fair');
  });

  it('should sum market prices correctly', () => {
    const selected = [makeSelected(10), makeSelected(20)];
    const wanted = [makeWanted(15), makeWanted(12)];
    const result = calculateTradeBalance(selected, wanted);
    expect(result.offerTotal).toBe(30);
    expect(result.wantTotal).toBe(27);
  });

  it('should treat null market prices as $0', () => {
    const selected = [makeSelected(10), makeSelected(null)];
    const wanted = [makeWanted(10)];
    const result = calculateTradeBalance(selected, wanted);
    expect(result.offerTotal).toBe(10);
    expect(result.wantTotal).toBe(10);
    expect(result.fairness).toBe('fair');
  });

  it('should mark as fair when difference < 15%', () => {
    const selected = [makeSelected(100)];
    const wanted = [makeWanted(90)]; // 10% diff
    const result = calculateTradeBalance(selected, wanted);
    expect(result.fairness).toBe('fair');
    expect(result.differencePercent).toBeCloseTo(10);
  });

  it('should mark as slight_imbalance when difference is 15-30%', () => {
    const selected = [makeSelected(100)];
    const wanted = [makeWanted(75)]; // 25% diff
    const result = calculateTradeBalance(selected, wanted);
    expect(result.fairness).toBe('slight_imbalance');
    expect(result.differencePercent).toBe(25);
  });

  it('should mark as imbalanced when difference > 30%', () => {
    const selected = [makeSelected(100)];
    const wanted = [makeWanted(50)]; // 50% diff
    const result = calculateTradeBalance(selected, wanted);
    expect(result.fairness).toBe('imbalanced');
    expect(result.differencePercent).toBe(50);
  });

  it('should handle when want side is higher than offer', () => {
    const selected = [makeSelected(30)];
    const wanted = [makeWanted(100)];
    const result = calculateTradeBalance(selected, wanted);
    expect(result.offerTotal).toBe(30);
    expect(result.wantTotal).toBe(100);
    expect(result.differencePercent).toBe(70);
    expect(result.fairness).toBe('imbalanced');
  });

  it('should handle exact boundary at 15%', () => {
    // 85/100 = 15% diff — boundary is < 15 for fair, so 15 is slight_imbalance
    const selected = [makeSelected(100)];
    const wanted = [makeWanted(85)];
    const result = calculateTradeBalance(selected, wanted);
    expect(result.fairness).toBe('slight_imbalance');
  });

  it('should handle exact boundary at 30%', () => {
    const selected = [makeSelected(100)];
    const wanted = [makeWanted(70)]; // exactly 30%
    const result = calculateTradeBalance(selected, wanted);
    expect(result.fairness).toBe('slight_imbalance');
  });

  it('should handle all-null prices gracefully', () => {
    const selected = [makeSelected(null), makeSelected(null)];
    const wanted = [makeWanted(null)];
    const result = calculateTradeBalance(selected, wanted);
    expect(result.offerTotal).toBe(0);
    expect(result.wantTotal).toBe(0);
    expect(result.differencePercent).toBe(0);
    expect(result.fairness).toBe('fair');
  });
});
