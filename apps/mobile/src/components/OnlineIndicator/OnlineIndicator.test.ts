import { describe, it, expect, vi } from 'vitest';

vi.mock('react-native', () => ({
  View: 'View',
}));

describe('OnlineIndicator', () => {
  it('should export a function', async () => {
    const mod = await import('./OnlineIndicator');
    expect(typeof mod.default).toBe('function');
  });

  it('should render without crashing when online', async () => {
    const { default: OnlineIndicator } = await import('./OnlineIndicator');
    const result = OnlineIndicator({ isOnline: true });
    expect(result).toBeDefined();
  });

  it('should render without crashing when offline', async () => {
    const { default: OnlineIndicator } = await import('./OnlineIndicator');
    const result = OnlineIndicator({ isOnline: false });
    expect(result).toBeDefined();
  });

  it('should accept size prop', async () => {
    const { default: OnlineIndicator } = await import('./OnlineIndicator');
    const resultSm = OnlineIndicator({ isOnline: true, size: 'sm' });
    const resultMd = OnlineIndicator({ isOnline: true, size: 'md' });
    expect(resultSm).toBeDefined();
    expect(resultMd).toBeDefined();
  });

  it('should accept className prop', async () => {
    const { default: OnlineIndicator } = await import('./OnlineIndicator');
    const result = OnlineIndicator({
      isOnline: true,
      className: 'absolute bottom-0 right-0',
    });
    expect(result).toBeDefined();
  });
});
