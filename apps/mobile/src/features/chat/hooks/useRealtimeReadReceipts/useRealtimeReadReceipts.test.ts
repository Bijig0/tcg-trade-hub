import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase', () => {
  const mockChannel = {
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockReturnThis(),
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

describe('useRealtimeReadReceipts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should export a function', async () => {
    const mod = await import('./useRealtimeReadReceipts');
    expect(typeof mod.default).toBe('function');
  });

  it('should subscribe to realtime updates for the given conversation', async () => {
    const { supabase } = await import('@/lib/supabase');
    const { renderHook } = await import('@testing-library/react-native');
    const { default: useRealtimeReadReceipts } = await import(
      './useRealtimeReadReceipts'
    );
    const { createQueryWrapper } = await import('@/test-utils/queryWrapper');

    renderHook(() => useRealtimeReadReceipts('conv-1'), {
      wrapper: createQueryWrapper(),
    });

    expect(supabase.channel).toHaveBeenCalledWith('read-receipts-conv-1');
  });

  it('should not subscribe when conversationId is empty', async () => {
    const { supabase } = await import('@/lib/supabase');
    const { renderHook } = await import('@testing-library/react-native');
    const { default: useRealtimeReadReceipts } = await import(
      './useRealtimeReadReceipts'
    );
    const { createQueryWrapper } = await import('@/test-utils/queryWrapper');

    renderHook(() => useRealtimeReadReceipts(''), {
      wrapper: createQueryWrapper(),
    });

    expect(supabase.channel).not.toHaveBeenCalled();
  });

  it('should remove the channel on unmount', async () => {
    const { supabase } = await import('@/lib/supabase');
    const { renderHook } = await import('@testing-library/react-native');
    const { default: useRealtimeReadReceipts } = await import(
      './useRealtimeReadReceipts'
    );
    const { createQueryWrapper } = await import('@/test-utils/queryWrapper');

    const { unmount } = renderHook(() => useRealtimeReadReceipts('conv-1'), {
      wrapper: createQueryWrapper(),
    });

    unmount();

    expect(supabase.removeChannel).toHaveBeenCalled();
  });
});
