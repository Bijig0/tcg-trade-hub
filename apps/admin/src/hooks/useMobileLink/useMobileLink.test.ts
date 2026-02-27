import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useMobileLink from './useMobileLink';

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

beforeEach(() => {
  wsInstances = [];
  vi.useFakeTimers();
  vi.stubGlobal('WebSocket', MockWebSocket);
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
  it('starts unlinked with no active path', () => {
    const { result } = renderHook(() => useMobileLink());

    expect(result.current.isLinked).toBe(false);
    expect(result.current.activePath).toBeNull();
    expect(result.current.lastEvent).toBeNull();
    expect(result.current.connected).toBe(false);
  });

  it('does not open a WebSocket until linked', () => {
    renderHook(() => useMobileLink());
    expect(wsInstances).toHaveLength(0);
  });

  it('opens WebSocket when toggled on', () => {
    const { result } = renderHook(() => useMobileLink());

    act(() => result.current.toggleLink());

    expect(result.current.isLinked).toBe(true);
    expect(wsInstances).toHaveLength(1);
  });

  it('reports connected after WS open', () => {
    const { result } = renderHook(() => useMobileLink());

    act(() => result.current.toggleLink());
    act(() => simulateOpen());

    expect(result.current.connected).toBe(true);
  });

  it('updates activePath on mobile:nav events', () => {
    const { result } = renderHook(() => useMobileLink());

    act(() => result.current.toggleLink());
    act(() => simulateOpen());
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

  it('ignores events without caller: mobile:nav', () => {
    const { result } = renderHook(() => useMobileLink());

    act(() => result.current.toggleLink());
    act(() => simulateOpen());
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

  it('ignores events without pathId', () => {
    const { result } = renderHook(() => useMobileLink());

    act(() => result.current.toggleLink());
    act(() => simulateOpen());
    act(() =>
      simulateMessage({
        caller: 'mobile:nav',
        message: 'no path',
        timestamp: 1000,
      }),
    );

    expect(result.current.activePath).toBeNull();
  });

  it('clears state and closes WS when toggled off', () => {
    const { result } = renderHook(() => useMobileLink());

    act(() => result.current.toggleLink());
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

    act(() => result.current.toggleLink());

    expect(result.current.isLinked).toBe(false);
    expect(result.current.activePath).toBeNull();
    expect(result.current.lastEvent).toBeNull();
    expect(latestWs().close).toHaveBeenCalled();
  });

  it('reconnects on WS close while linked', () => {
    const { result } = renderHook(() => useMobileLink());

    act(() => result.current.toggleLink());
    expect(wsInstances).toHaveLength(1);

    act(() => latestWs().onclose?.());
    expect(result.current.connected).toBe(false);

    act(() => vi.advanceTimersByTime(3_000));
    expect(wsInstances).toHaveLength(2);
  });

  it('does not reconnect after unlinking', () => {
    const { result } = renderHook(() => useMobileLink());

    act(() => result.current.toggleLink());
    act(() => simulateOpen());
    act(() => result.current.toggleLink()); // unlink

    // Advance past reconnect delay
    act(() => vi.advanceTimersByTime(5_000));

    // Should only have the original WS, no reconnects
    expect(wsInstances).toHaveLength(1);
  });
});
