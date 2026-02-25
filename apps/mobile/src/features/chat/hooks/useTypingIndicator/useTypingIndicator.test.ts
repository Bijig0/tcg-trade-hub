import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase', () => {
  const mockChannel = {
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockReturnThis(),
    send: vi.fn(),
  };
  return {
    supabase: {
      channel: vi.fn(() => mockChannel),
      removeChannel: vi.fn(),
    },
  };
});

vi.mock('@/context/AuthProvider', () => ({
  useAuth: () => ({ user: { id: 'user-1' } }),
}));

describe('useTypingIndicator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should export a function', async () => {
    const mod = await import('./useTypingIndicator');
    expect(typeof mod.default).toBe('function');
  });

  it('should return the expected shape', async () => {
    const { renderHook } = await import('@testing-library/react-native');
    const { default: useTypingIndicator } = await import('./useTypingIndicator');
    const { createQueryWrapper } = await import('@/test-utils/queryWrapper');

    const { result } = renderHook(() => useTypingIndicator('conv-1'), {
      wrapper: createQueryWrapper(),
    });

    expect(result.current).toHaveProperty('isOtherUserTyping');
    expect(result.current).toHaveProperty('sendTypingStart');
    expect(result.current).toHaveProperty('sendTypingStop');
    expect(result.current.isOtherUserTyping).toBe(false);
    expect(typeof result.current.sendTypingStart).toBe('function');
    expect(typeof result.current.sendTypingStop).toBe('function');
  });

  it('should throttle sendTypingStart calls', async () => {
    const { supabase } = await import('@/lib/supabase');
    const { renderHook, act } = await import('@testing-library/react-native');
    const { default: useTypingIndicator } = await import('./useTypingIndicator');
    const { createQueryWrapper } = await import('@/test-utils/queryWrapper');

    const { result } = renderHook(() => useTypingIndicator('conv-1'), {
      wrapper: createQueryWrapper(),
    });

    const mockChannel = (supabase.channel as ReturnType<typeof vi.fn>).mock.results[0]?.value;

    act(() => {
      result.current.sendTypingStart();
      result.current.sendTypingStart();
      result.current.sendTypingStart();
    });

    // Should only fire once due to throttle
    if (mockChannel) {
      expect(mockChannel.send).toHaveBeenCalledTimes(1);
    }
  });
});
