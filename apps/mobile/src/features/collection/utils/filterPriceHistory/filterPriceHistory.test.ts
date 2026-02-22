import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import filterPriceHistory from './filterPriceHistory';
import type { PricePoint } from '@/services/cardData';

const makePoints = (count: number, startDate: string, basePrice: number): PricePoint[] => {
  const start = new Date(startDate);
  return Array.from({ length: count }, (_, i) => {
    const date = new Date(start);
    date.setDate(date.getDate() + i);
    return {
      date: date.toISOString().slice(0, 10),
      price: basePrice + i * 0.5,
    };
  });
};

describe('filterPriceHistory', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-22'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return empty result for empty input', () => {
    const result = filterPriceHistory([], '1m');
    expect(result.points).toEqual([]);
    expect(result.high).toBe(0);
    expect(result.low).toBe(0);
    expect(result.changePercent).toBe(0);
  });

  it('should return all points for max range', () => {
    const points = makePoints(365, '2025-02-22', 10);
    const result = filterPriceHistory(points, 'max');
    expect(result.points).toHaveLength(365);
  });

  it('should filter to ~30 days for 1m range', () => {
    const points = makePoints(365, '2025-02-22', 10);
    const result = filterPriceHistory(points, '1m');
    // Points from 2026-01-22 onwards (about 31 days)
    for (const p of result.points) {
      expect(p.date >= '2026-01-22').toBe(true);
    }
    expect(result.points.length).toBeGreaterThan(0);
    expect(result.points.length).toBeLessThan(365);
  });

  it('should calculate high and low correctly', () => {
    const points: PricePoint[] = [
      { date: '2026-02-01', price: 5 },
      { date: '2026-02-10', price: 15 },
      { date: '2026-02-20', price: 10 },
    ];
    const result = filterPriceHistory(points, '1m');
    expect(result.high).toBe(15);
    expect(result.low).toBe(5);
  });

  it('should calculate change percent correctly', () => {
    const points: PricePoint[] = [
      { date: '2026-02-01', price: 10 },
      { date: '2026-02-20', price: 15 },
    ];
    const result = filterPriceHistory(points, '1m');
    expect(result.changePercent).toBe(50);
  });

  it('should handle negative change percent', () => {
    const points: PricePoint[] = [
      { date: '2026-02-01', price: 20 },
      { date: '2026-02-20', price: 10 },
    ];
    const result = filterPriceHistory(points, '1m');
    expect(result.changePercent).toBe(-50);
  });

  it('should handle zero first price without dividing by zero', () => {
    const points: PricePoint[] = [
      { date: '2026-02-01', price: 0 },
      { date: '2026-02-20', price: 10 },
    ];
    const result = filterPriceHistory(points, '1m');
    expect(result.changePercent).toBe(0);
  });

  it('should filter to 3 months for 3m range', () => {
    const points = makePoints(365, '2025-02-22', 10);
    const result = filterPriceHistory(points, '3m');
    for (const p of result.points) {
      expect(p.date >= '2025-11-22').toBe(true);
    }
  });
});
