import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import useMobileLink from './useMobileLink';
import type { Simulator } from './useMobileLink';

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const MOCK_SIMULATORS: Simulator[] = [
  { udid: 'AAAA-1111', name: 'iPhone 16 Pro', state: 'Booted', runtime: 'iOS 18.2' },
  { udid: 'BBBB-2222', name: 'iPhone 16 Pro Max', state: 'Shutdown', runtime: 'iOS 18.2' },
  { udid: 'CCCC-3333', name: 'iPhone 16', state: 'Shutdown', runtime: 'iOS 18.2' },
];

// ---------------------------------------------------------------------------
// Mock WebSocket
// ---------------------------------------------------------------------------

type WSInstance = {
  onopen: (() => void) | null;
  onclose: (() => void) | null;
  onerror: (() => void) | null;
  onmessage: ((msg: { data: string }) => void) | null;
  close: ReturnType<typeof vi.fn>;
  readyState: number;
};

let wsInstances: WSInstance[] = [];

class MockWebSocket {
  onopen: (() => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: (() => void) | null = null;
  onmessage: ((msg: { data: string }) => void) | null = null;
  close = vi.fn();
  readyState = 0;

  constructor() {
    wsInstances.push(this as unknown as WSInstance);
  }
}

// ---------------------------------------------------------------------------
// Mock fetch
// ---------------------------------------------------------------------------

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  wsInstances = [];
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.stubGlobal('WebSocket', MockWebSocket);

  fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(MOCK_SIMULATORS),
  });
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const latestWs = (): WSInstance => wsInstances[wsInstances.length - 1];

const simulateOpen = () => {
  latestWs().onopen?.();
};

const simulateMessage = (data: Record<string, unknown>) => {
  latestWs().onmessage?.({ data: JSON.stringify(data) });
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useMobileLink', () => {
  describe('simulator list', () => {
    it('fetches simulator list on mount', async () => {
      const { result } = renderHook(() => useMobileLink());

      await waitFor(() => {
        expect(result.current.isLoadingSimulators).toBe(false);
      });

      expect(fetchMock).toHaveBeenCalledWith(
        'http://localhost:4243/api/simulators',
        expect.objectContaining({ signal: expect.any(AbortSignal) }),
      );
      expect(result.current.simulators).toEqual(MOCK_SIMULATORS);
      expect(result.current.simulatorError).toBeNull();
    });

    it('shows error when fetch fails', async () => {
      fetchMock.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useMobileLink());

      await waitFor(() => {
        expect(result.current.isLoadingSimulators).toBe(false);
      });

      expect(result.current.simulators).toEqual([]);
      expect(result.current.simulatorError).toBe('Network error');
    });

    it('shows friendly error when server unreachable', async () => {
      fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'));

      const { result } = renderHook(() => useMobileLink());

      await waitFor(() => {
        expect(result.current.isLoadingSimulators).toBe(false);
      });

      expect(result.current.simulatorError).toBe('Cannot reach graph server');
    });

    it('refreshSimulators re-fetches the list', async () => {
      const { result } = renderHook(() => useMobileLink());

      await waitFor(() => {
        expect(result.current.isLoadingSimulators).toBe(false);
      });

      expect(fetchMock).toHaveBeenCalledTimes(1);

      await act(async () => {
        result.current.refreshSimulators();
      });

      await waitFor(() => {
        expect(result.current.isLoadingSimulators).toBe(false);
      });

      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
  });

  describe('linking', () => {
    it('starts unlinked with no active path', async () => {
      const { result } = renderHook(() => useMobileLink());

      await waitFor(() => {
        expect(result.current.isLoadingSimulators).toBe(false);
      });

      expect(result.current.linkedSimulator).toBeNull();
      expect(result.current.activePath).toBeNull();
      expect(result.current.lastEvent).toBeNull();
      expect(result.current.connected).toBe(false);
    });

    it('does not open a WebSocket until linked', async () => {
      renderHook(() => useMobileLink());

      await waitFor(() => {
        expect(fetchMock).toHaveBeenCalled();
      });

      expect(wsInstances).toHaveLength(0);
    });

    it('linkTo calls boot endpoint then opens WebSocket', async () => {
      fetchMock
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(MOCK_SIMULATORS),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ ok: true, udid: 'AAAA-1111', name: 'iPhone 16 Pro' }),
        });

      const { result } = renderHook(() => useMobileLink());

      await waitFor(() => {
        expect(result.current.simulators).toHaveLength(3);
      });

      await act(async () => {
        result.current.linkTo('AAAA-1111');
      });

      await waitFor(() => {
        expect(result.current.isBooting).toBe(false);
      });

      expect(fetchMock).toHaveBeenCalledWith(
        'http://localhost:4243/api/simulators/AAAA-1111/boot',
        expect.objectContaining({ method: 'POST' }),
      );
      expect(result.current.linkedSimulator).toEqual({
        udid: 'AAAA-1111',
        name: 'iPhone 16 Pro',
        state: 'Booted',
        runtime: 'iOS 18.2',
      });
      expect(wsInstances).toHaveLength(1);
    });

    it('shows isBooting during boot request', async () => {
      let resolveBootFetch: (value: unknown) => void;
      fetchMock
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(MOCK_SIMULATORS),
        })
        .mockImplementationOnce(
          () =>
            new Promise((resolve) => {
              resolveBootFetch = resolve;
            }),
        );

      const { result } = renderHook(() => useMobileLink());

      await waitFor(() => {
        expect(result.current.simulators).toHaveLength(3);
      });

      act(() => {
        result.current.linkTo('BBBB-2222');
      });

      await waitFor(() => {
        expect(result.current.isBooting).toBe(true);
      });

      await act(async () => {
        resolveBootFetch!({
          ok: true,
          json: () => Promise.resolve({ ok: true, udid: 'BBBB-2222', name: 'iPhone 16 Pro Max' }),
        });
      });

      await waitFor(() => {
        expect(result.current.isBooting).toBe(false);
      });
    });

    it('sets simulatorError when boot fails', async () => {
      fetchMock
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(MOCK_SIMULATORS),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: () => Promise.resolve({ error: 'Simulator not found' }),
        });

      const { result } = renderHook(() => useMobileLink());

      await waitFor(() => {
        expect(result.current.simulators).toHaveLength(3);
      });

      await act(async () => {
        result.current.linkTo('AAAA-1111');
      });

      await waitFor(() => {
        expect(result.current.isBooting).toBe(false);
      });

      expect(result.current.simulatorError).toBe('Boot failed: Simulator not found');
      expect(result.current.linkedSimulator).toBeNull();
    });

    it('unlink closes WebSocket and clears linked simulator', async () => {
      fetchMock
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(MOCK_SIMULATORS),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ ok: true, udid: 'AAAA-1111', name: 'iPhone 16 Pro' }),
        });

      const { result } = renderHook(() => useMobileLink());

      await waitFor(() => {
        expect(result.current.simulators).toHaveLength(3);
      });

      await act(async () => {
        result.current.linkTo('AAAA-1111');
      });

      await waitFor(() => {
        expect(result.current.linkedSimulator).not.toBeNull();
      });

      act(() => simulateOpen());

      act(() =>
        simulateMessage({
          pathId: 'state:meetup',
          caller: 'mobile:nav',
          message: 'Meetups',
          timestamp: 2000,
        }),
      );

      expect(result.current.activePath).toBe('state:meetup');

      act(() => result.current.unlink());

      expect(result.current.linkedSimulator).toBeNull();
      expect(result.current.activePath).toBeNull();
      expect(result.current.lastEvent).toBeNull();
      expect(latestWs().close).toHaveBeenCalled();
    });
  });

  describe('WebSocket events', () => {
    const setupLinked = async (result: { current: ReturnType<typeof useMobileLink> }) => {
      fetchMock
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(MOCK_SIMULATORS),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ ok: true, udid: 'AAAA-1111', name: 'iPhone 16 Pro' }),
        });

      await waitFor(() => {
        expect(result.current.simulators).toHaveLength(3);
      });

      await act(async () => {
        result.current.linkTo('AAAA-1111');
      });

      await waitFor(() => {
        expect(result.current.linkedSimulator).not.toBeNull();
      });

      act(() => simulateOpen());
    };

    it('updates activePath on mobile:nav events', async () => {
      const { result } = renderHook(() => useMobileLink());
      await setupLinked(result);

      act(() =>
        simulateMessage({
          pathId: 'state:listing',
          caller: 'mobile:nav',
          message: 'Listings',
          timestamp: 1000,
        }),
      );

      expect(result.current.activePath).toBe('state:listing');
      expect(result.current.lastEvent).toEqual({
        pathId: 'state:listing',
        message: 'Listings',
        timestamp: 1000,
      });
    });

    it('ignores events without caller: mobile:nav', async () => {
      const { result } = renderHook(() => useMobileLink());
      await setupLinked(result);

      act(() =>
        simulateMessage({
          pathId: 'state:listing',
          caller: 'mutation',
          message: 'some mutation',
          timestamp: 1000,
        }),
      );

      expect(result.current.activePath).toBeNull();
      expect(result.current.lastEvent).toBeNull();
    });

    it('ignores events without pathId', async () => {
      const { result } = renderHook(() => useMobileLink());
      await setupLinked(result);

      act(() =>
        simulateMessage({
          caller: 'mobile:nav',
          message: 'no path',
          timestamp: 1000,
        }),
      );

      expect(result.current.activePath).toBeNull();
    });

    it('reconnects on WS close while linked', async () => {
      const { result } = renderHook(() => useMobileLink());
      await setupLinked(result);

      expect(wsInstances).toHaveLength(1);

      act(() => latestWs().onclose?.());
      expect(result.current.connected).toBe(false);

      act(() => vi.advanceTimersByTime(3_000));
      expect(wsInstances).toHaveLength(2);
    });

    it('does not reconnect after unlinking', async () => {
      const { result } = renderHook(() => useMobileLink());
      await setupLinked(result);

      act(() => result.current.unlink());

      act(() => vi.advanceTimersByTime(5_000));

      // Only the one WS from the link, no reconnects
      expect(wsInstances).toHaveLength(1);
    });
  });
});
