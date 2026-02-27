import { describe, it, expect, vi } from 'vitest';

// Mock expo-router
vi.mock('expo-router', () => ({
  useSegments: vi.fn(() => ['(tabs)', '(listings)']),
}));

// Mock the dev emitter
vi.mock('@/services/devLiveEmitter/devLiveEmitter', () => ({
  devEmitter: {
    emit: vi.fn(),
    forPath: vi.fn(() => vi.fn()),
  },
  createTraceId: vi.fn(() => 'mock-trace-id'),
}));

describe('useDevGraphEmitter', () => {
  it('should be importable without errors', async () => {
    const mod = await import('./useDevGraphEmitter');
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe('function');
  });
});
