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

describe('useNegotiationStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should export a function', async () => {
    const mod = await import('./useNegotiationStatus');
    expect(typeof mod.default).toBe('function');
  });

  it('should subscribe to realtime updates for the given conversation', async () => {
    const { supabase } = await import('@/lib/supabase');
    const { renderHook } = await import('@testing-library/react-native');
    const { default: useNegotiationStatus } = await import('./useNegotiationStatus');
    const { createQueryWrapper } = await import('@/test-utils/queryWrapper');

    renderHook(() => useNegotiationStatus('conv-1'), {
      wrapper: createQueryWrapper(),
    });

    expect(supabase.channel).toHaveBeenCalledWith('conversation-status:conv-1');
  });

  it('should not subscribe when conversationId is empty', async () => {
    const { supabase } = await import('@/lib/supabase');
    const { renderHook } = await import('@testing-library/react-native');
    const { default: useNegotiationStatus } = await import('./useNegotiationStatus');
    const { createQueryWrapper } = await import('@/test-utils/queryWrapper');

    renderHook(() => useNegotiationStatus(''), {
      wrapper: createQueryWrapper(),
    });

    expect(supabase.channel).not.toHaveBeenCalled();
  });
});
