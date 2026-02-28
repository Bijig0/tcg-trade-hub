import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('react-native', () => ({
  AppState: {
    addEventListener: vi.fn(() => ({ remove: vi.fn() })),
  },
}));

vi.mock('@/lib/supabase', () => {
  const mockChannel = {
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockReturnThis(),
    track: vi.fn(),
    untrack: vi.fn(),
    presenceState: vi.fn(() => ({
      'user-1': [{ online_at: '2026-02-28T00:00:00Z' }],
      'user-2': [{ online_at: '2026-02-28T00:00:00Z' }],
    })),
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

describe('useOnlinePresence', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should export a function', async () => {
    const mod = await import('./useOnlinePresence');
    expect(typeof mod.default).toBe('function');
  });

  it('should return onlineUserIds and isOnline', async () => {
    const { renderHook } = await import('@testing-library/react-native');
    const { default: useOnlinePresence } = await import('./useOnlinePresence');

    const { result } = renderHook(() => useOnlinePresence());

    expect(result.current).toHaveProperty('onlineUserIds');
    expect(result.current).toHaveProperty('isOnline');
    expect(result.current.onlineUserIds).toBeInstanceOf(Set);
    expect(typeof result.current.isOnline).toBe('function');
  });

  it('should subscribe to the presence:global channel', async () => {
    const { supabase } = await import('@/lib/supabase');
    const { renderHook } = await import('@testing-library/react-native');
    const { default: useOnlinePresence } = await import('./useOnlinePresence');

    renderHook(() => useOnlinePresence());

    expect(supabase.channel).toHaveBeenCalledWith('presence:global', {
      config: { presence: { key: 'user-1' } },
    });
  });

  it('should remove the channel on unmount', async () => {
    const { supabase } = await import('@/lib/supabase');
    const { renderHook } = await import('@testing-library/react-native');
    const { default: useOnlinePresence } = await import('./useOnlinePresence');

    const { unmount } = renderHook(() => useOnlinePresence());

    unmount();

    expect(supabase.removeChannel).toHaveBeenCalled();
  });
});
