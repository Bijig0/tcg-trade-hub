import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Alert } from 'react-native';

vi.mock('expo-clipboard', () => ({
  setStringAsync: vi.fn(),
}));

describe('useLongPressMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should export a function', async () => {
    const mod = await import('./useLongPressMessage');
    expect(typeof mod.default).toBe('function');
  });

  it('should show Copy and Report for other user text message', async () => {
    const alertSpy = vi.spyOn(Alert, 'alert');
    const { renderHook, act } = await import('@testing-library/react-native');
    const { default: useLongPressMessage } = await import('./useLongPressMessage');

    const { result } = renderHook(() => useLongPressMessage('user-1'));

    const otherMessage = {
      id: 'msg-1',
      conversation_id: 'conv-1',
      sender_id: 'user-2',
      type: 'text' as const,
      body: 'Hello there',
      payload: null,
      created_at: '2025-01-01T00:00:00Z',
    };

    act(() => {
      result.current.handleLongPress(otherMessage);
    });

    expect(alertSpy).toHaveBeenCalledWith(
      'Message',
      undefined,
      expect.arrayContaining([
        expect.objectContaining({ text: 'Copy Text' }),
        expect.objectContaining({ text: 'Report Message', style: 'destructive' }),
        expect.objectContaining({ text: 'Cancel', style: 'cancel' }),
      ]),
    );
  });

  it('should show only Copy for own text message', async () => {
    const alertSpy = vi.spyOn(Alert, 'alert');
    const { renderHook, act } = await import('@testing-library/react-native');
    const { default: useLongPressMessage } = await import('./useLongPressMessage');

    const { result } = renderHook(() => useLongPressMessage('user-1'));

    const ownMessage = {
      id: 'msg-2',
      conversation_id: 'conv-1',
      sender_id: 'user-1',
      type: 'text' as const,
      body: 'My own message',
      payload: null,
      created_at: '2025-01-01T00:00:00Z',
    };

    act(() => {
      result.current.handleLongPress(ownMessage);
    });

    expect(alertSpy).toHaveBeenCalledWith(
      'Message',
      undefined,
      expect.arrayContaining([
        expect.objectContaining({ text: 'Copy Text' }),
        expect.objectContaining({ text: 'Cancel' }),
      ]),
    );
  });

  it('should not show alert for own non-text message', async () => {
    const alertSpy = vi.spyOn(Alert, 'alert');
    const { renderHook, act } = await import('@testing-library/react-native');
    const { default: useLongPressMessage } = await import('./useLongPressMessage');

    const { result } = renderHook(() => useLongPressMessage('user-1'));

    const ownNonTextMessage = {
      id: 'msg-3',
      conversation_id: 'conv-1',
      sender_id: 'user-1',
      type: 'card_offer' as const,
      body: null,
      payload: null,
      created_at: '2025-01-01T00:00:00Z',
    };

    act(() => {
      result.current.handleLongPress(ownNonTextMessage);
    });

    // Only cancel button → should not show
    expect(alertSpy).not.toHaveBeenCalled();
  });
});
