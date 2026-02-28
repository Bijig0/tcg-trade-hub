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

describe('useRealtimeMeetupUpdates', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should export a function', async () => {
    const mod = await import('./useRealtimeMeetupUpdates');
    expect(typeof mod.default).toBe('function');
  });

  it('should subscribe to realtime updates for the given meetup', async () => {
    const { supabase } = await import('@/lib/supabase');
    const { renderHook } = await import('@testing-library/react-native');
    const { default: useRealtimeMeetupUpdates } = await import(
      './useRealtimeMeetupUpdates'
    );
    const { createQueryWrapper } = await import('@/test-utils/queryWrapper');

    renderHook(() => useRealtimeMeetupUpdates('meetup-1'), {
      wrapper: createQueryWrapper(),
    });

    expect(supabase.channel).toHaveBeenCalledWith('meetup-updates-meetup-1');
  });

  it('should not subscribe when meetupId is empty', async () => {
    const { supabase } = await import('@/lib/supabase');
    const { renderHook } = await import('@testing-library/react-native');
    const { default: useRealtimeMeetupUpdates } = await import(
      './useRealtimeMeetupUpdates'
    );
    const { createQueryWrapper } = await import('@/test-utils/queryWrapper');

    renderHook(() => useRealtimeMeetupUpdates(''), {
      wrapper: createQueryWrapper(),
    });

    expect(supabase.channel).not.toHaveBeenCalled();
  });

  it('should remove the channel on unmount', async () => {
    const { supabase } = await import('@/lib/supabase');
    const { renderHook } = await import('@testing-library/react-native');
    const { default: useRealtimeMeetupUpdates } = await import(
      './useRealtimeMeetupUpdates'
    );
    const { createQueryWrapper } = await import('@/test-utils/queryWrapper');

    const { unmount } = renderHook(() => useRealtimeMeetupUpdates('meetup-1'), {
      wrapper: createQueryWrapper(),
    });

    unmount();

    expect(supabase.removeChannel).toHaveBeenCalled();
  });
});
