import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    rpc: vi.fn(),
  },
}));

vi.mock('@/context/AuthProvider', () => ({
  useAuth: () => ({ user: { id: 'user-1' } }),
}));

describe('useChatBlockCheck', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should export a function', async () => {
    const mod = await import('./useChatBlockCheck');
    expect(typeof mod.default).toBe('function');
  });

  it('should return block state from RPC', async () => {
    const { supabase } = await import('@/lib/supabase');
    (supabase.rpc as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [{ blocked_by_me: false, blocked_by_them: true }],
      error: null,
    });

    const { renderHook, waitFor } = await import('@testing-library/react-native');
    const { default: useChatBlockCheck } = await import('./useChatBlockCheck');
    const { createQueryWrapper } = await import('@/test-utils/queryWrapper');

    const { result } = renderHook(() => useChatBlockCheck('user-2'), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual({
      isBlocked: true,
      blockedByMe: false,
      blockedByThem: true,
    });
  });

  it('should not query when otherUserId is empty', async () => {
    const { renderHook } = await import('@testing-library/react-native');
    const { default: useChatBlockCheck } = await import('./useChatBlockCheck');
    const { createQueryWrapper } = await import('@/test-utils/queryWrapper');

    const { result } = renderHook(() => useChatBlockCheck(''), {
      wrapper: createQueryWrapper(),
    });

    expect(result.current.isFetching).toBe(false);
  });
});
