import { describe, it, expect, vi, beforeEach } from 'vitest';
import sendPushNotification from './sendPushNotification';

const mockInvoke = vi.fn();

const mockSupabase = {
  functions: {
    invoke: mockInvoke,
  },
} as unknown as Parameters<typeof sendPushNotification>[0];

beforeEach(() => {
  vi.clearAllMocks();
});

describe('sendPushNotification', () => {
  it('should invoke Edge Function with correct payload', async () => {
    mockInvoke.mockResolvedValue({ data: null, error: null });

    await sendPushNotification(mockSupabase, {
      recipientUserId: 'user-123',
      title: 'Test Title',
      body: 'Test Body',
      data: { offerId: 'offer-abc' },
    });

    expect(mockInvoke).toHaveBeenCalledOnce();
    expect(mockInvoke).toHaveBeenCalledWith('send-push-notification', {
      body: {
        type: 'direct',
        recipientUserId: 'user-123',
        title: 'Test Title',
        body: 'Test Body',
        data: { offerId: 'offer-abc' },
      },
    });
  });

  it('should invoke without optional data field', async () => {
    mockInvoke.mockResolvedValue({ data: null, error: null });

    await sendPushNotification(mockSupabase, {
      recipientUserId: 'user-456',
      title: 'No Data',
      body: 'No extra data',
    });

    expect(mockInvoke).toHaveBeenCalledWith('send-push-notification', {
      body: {
        type: 'direct',
        recipientUserId: 'user-456',
        title: 'No Data',
        body: 'No extra data',
      },
    });
  });

  it('should not throw on invocation error (fire-and-forget)', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockInvoke.mockRejectedValue(new Error('Network failure'));

    await expect(
      sendPushNotification(mockSupabase, {
        recipientUserId: 'user-789',
        title: 'Fail',
        body: 'This will fail',
      }),
    ).resolves.toBeUndefined();

    expect(consoleSpy).toHaveBeenCalledWith(
      '[sendPushNotification]',
      expect.any(Error),
    );

    consoleSpy.mockRestore();
  });
});
