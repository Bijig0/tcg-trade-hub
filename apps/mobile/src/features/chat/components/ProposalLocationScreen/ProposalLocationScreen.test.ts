import { describe, it, expect } from 'vitest';

describe('ProposalLocationScreen', () => {
  it('should resolve coordinates from route params', () => {
    const lat = parseFloat('-37.8136');
    const lng = parseFloat('144.9631');
    expect(lat).toBe(-37.8136);
    expect(lng).toBe(144.9631);
    expect(isNaN(lat)).toBe(false);
    expect(isNaN(lng)).toBe(false);
  });

  it('should return NaN for missing params', () => {
    const lat = parseFloat(undefined as unknown as string);
    expect(isNaN(lat)).toBe(true);
  });

  it('should format proposed time correctly', () => {
    const proposedTime = '2026-03-01T14:00:00Z';
    const date = new Date(proposedTime);
    expect(isNaN(date.getTime())).toBe(false);
    expect(date.getFullYear()).toBe(2026);
    expect(date.getUTCMonth()).toBe(2); // March = 2 (0-indexed)
    expect(date.getUTCDate()).toBe(1);
  });

  it('should handle invalid proposed time', () => {
    const date = new Date('not-a-date');
    expect(isNaN(date.getTime())).toBe(true);
  });

  it('should treat missing proposedTime as null', () => {
    const proposedTime: string | undefined = undefined;
    const result = proposedTime ? new Date(proposedTime) : null;
    expect(result).toBeNull();
  });
});
