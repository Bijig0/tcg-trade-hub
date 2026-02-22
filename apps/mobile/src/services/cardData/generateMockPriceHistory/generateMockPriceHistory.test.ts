import { describe, it, expect } from 'vitest';
import generateMockPriceHistory from './generateMockPriceHistory';

describe('generateMockPriceHistory', () => {
  it('should return correct number of data points', () => {
    const result = generateMockPriceHistory(42.5, 90);
    expect(result.points).toHaveLength(90);
  });

  it('should return empty history for zero or negative price', () => {
    const result = generateMockPriceHistory(0);
    expect(result.points).toHaveLength(0);
    expect(result.high).toBe(0);
    expect(result.low).toBe(0);
    expect(result.changePercent).toBe(0);
  });

  it('should return empty history for zero or negative days', () => {
    const result = generateMockPriceHistory(42.5, 0);
    expect(result.points).toHaveLength(0);
  });

  it('should produce deterministic output for the same marketPrice', () => {
    const a = generateMockPriceHistory(42.5, 30);
    const b = generateMockPriceHistory(42.5, 30);
    expect(a.points).toEqual(b.points);
    expect(a.high).toBe(b.high);
    expect(a.low).toBe(b.low);
    expect(a.changePercent).toBe(b.changePercent);
  });

  it('should produce different output for different marketPrices', () => {
    const a = generateMockPriceHistory(42.5, 30);
    const b = generateMockPriceHistory(100.0, 30);
    expect(a.points).not.toEqual(b.points);
  });

  it('should have high >= low', () => {
    const result = generateMockPriceHistory(42.5, 90);
    expect(result.high).toBeGreaterThanOrEqual(result.low);
  });

  it('should have all prices positive', () => {
    const result = generateMockPriceHistory(5.0, 365);
    for (const point of result.points) {
      expect(point.price).toBeGreaterThan(0);
    }
  });

  it('should have dates in ascending order', () => {
    const result = generateMockPriceHistory(42.5, 90);
    for (let i = 1; i < result.points.length; i++) {
      expect(result.points[i]!.date > result.points[i - 1]!.date).toBe(true);
    }
  });

  it('should compute changePercent correctly', () => {
    const result = generateMockPriceHistory(42.5, 30);
    const first = result.points[0]!.price;
    const last = result.points[result.points.length - 1]!.price;
    const expected = Math.round(((last - first) / first) * 10000) / 100;
    expect(result.changePercent).toBe(expected);
  });

  it('should default to 365 days', () => {
    const result = generateMockPriceHistory(42.5);
    expect(result.points).toHaveLength(365);
  });
});
