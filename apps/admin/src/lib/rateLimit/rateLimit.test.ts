import { describe, it, expect, beforeEach } from 'vitest';
import { checkRateLimit, _clearStore } from './rateLimit';

beforeEach(() => {
  _clearStore();
});

describe('checkRateLimit', () => {
  it('should allow the first request', () => {
    const result = checkRateLimit('user-1');
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(19);
  });

  it('should track remaining count correctly', () => {
    for (let i = 0; i < 5; i++) {
      checkRateLimit('user-2');
    }
    const result = checkRateLimit('user-2');
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(14);
  });

  it('should deny after max requests exceeded', () => {
    const config = { maxRequests: 3, windowMs: 60_000 };
    checkRateLimit('user-3', config);
    checkRateLimit('user-3', config);
    checkRateLimit('user-3', config);
    const result = checkRateLimit('user-3', config);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('should track different keys independently', () => {
    const config = { maxRequests: 1, windowMs: 60_000 };
    checkRateLimit('user-a', config);
    const resultA = checkRateLimit('user-a', config);
    const resultB = checkRateLimit('user-b', config);
    expect(resultA.allowed).toBe(false);
    expect(resultB.allowed).toBe(true);
  });

  it('should return positive resetInMs', () => {
    const result = checkRateLimit('user-4');
    expect(result.resetInMs).toBeGreaterThan(0);
    expect(result.resetInMs).toBeLessThanOrEqual(60_000);
  });
});
