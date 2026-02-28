import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn(() =>
              Promise.resolve({
                data: { last_read_message_id: 'msg-42' },
                error: null,
              }),
            ),
          })),
        })),
      })),
    })),
  },
}));

describe('useOtherUserReadReceipt', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should export a function', async () => {
    const mod = await import('./useOtherUserReadReceipt');
    expect(typeof mod.default).toBe('function');
  });

  it('should be disabled when conversationId is empty', async () => {
    const { renderHook } = await import('@testing-library/react-native');
    const { default: useOtherUserReadReceipt } = await import(
      './useOtherUserReadReceipt'
    );
    const { createQueryWrapper } = await import('@/test-utils/queryWrapper');

    const { result } = renderHook(
      () => useOtherUserReadReceipt('', 'other-user-1'),
      { wrapper: createQueryWrapper() },
    );

    // Query should not be fetching because enabled is false
    expect(result.current.isFetching).toBe(false);
  });

  it('should be disabled when otherUserId is empty', async () => {
    const { renderHook } = await import('@testing-library/react-native');
    const { default: useOtherUserReadReceipt } = await import(
      './useOtherUserReadReceipt'
    );
    const { createQueryWrapper } = await import('@/test-utils/queryWrapper');

    const { result } = renderHook(
      () => useOtherUserReadReceipt('conv-1', ''),
      { wrapper: createQueryWrapper() },
    );

    expect(result.current.isFetching).toBe(false);
  });
});
