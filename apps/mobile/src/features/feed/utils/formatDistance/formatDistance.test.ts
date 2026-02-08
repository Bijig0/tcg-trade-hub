import { describe, it, expect } from 'vitest';
import formatDistance from './formatDistance';

describe('formatDistance', () => {
  it('should format distances >= 1 km with one decimal', () => {
    expect(formatDistance(2.345)).toBe('2.3 km');
    expect(formatDistance(15.0)).toBe('15.0 km');
    expect(formatDistance(1.0)).toBe('1.0 km');
  });

  it('should show "< 1 km" for distances under 1', () => {
    expect(formatDistance(0.5)).toBe('< 1 km');
    expect(formatDistance(0.01)).toBe('< 1 km');
    expect(formatDistance(0.99)).toBe('< 1 km');
  });

  it('should handle zero distance', () => {
    expect(formatDistance(0)).toBe('< 1 km');
  });

  it('should handle large distances', () => {
    expect(formatDistance(99.9)).toBe('99.9 km');
  });
});
