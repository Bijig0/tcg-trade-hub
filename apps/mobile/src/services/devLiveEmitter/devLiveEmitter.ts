/**
 * Dev-only live event emitter for the graph server.
 *
 * Inlined from flow-graph's createLiveEmitter to avoid pulling in
 * better-sqlite3 and other native dependencies into the mobile bundle.
 * All calls are fire-and-forget with a 2s timeout; errors are swallowed.
 *
 * Only initializes when __DEV__ is true.
 */

type LiveEventPayload = {
  pathId: string;
  stepIndex: number;
  status: 'started' | 'success' | 'error';
  operationId?: string;
  message?: string;
  traceId: string;
  timestamp: number;
  caller?: string;
};

type ScopedEmitter = (
  stepIndex: number,
  status: 'started' | 'success' | 'error',
  opts?: { operationId?: string; message?: string },
) => void;

type LiveEmitter = {
  emit: (event: LiveEventPayload) => void;
  forPath: (pathId: string, traceId: string, caller: string) => ScopedEmitter;
};

export const createTraceId = (): string => {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `${ts}-${rand}`;
};

const GRAPH_SERVER_URL =
  process.env.EXPO_PUBLIC_GRAPH_SERVER_URL ?? 'http://localhost:4243';

const createDevLiveEmitter = (): LiveEmitter => {
  const emit = (event: LiveEventPayload): void => {
    try {
      fetch(`${GRAPH_SERVER_URL}/api/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
        signal: AbortSignal.timeout(2_000),
      }).catch(() => {});
    } catch {
      // fire and forget
    }
  };

  const forPath = (
    pathId: string,
    traceId: string,
    caller: string,
  ): ScopedEmitter => {
    return (stepIndex, status, opts) => {
      emit({
        pathId,
        stepIndex,
        status,
        traceId,
        timestamp: Date.now(),
        caller,
        ...opts,
      });
    };
  };

  return { emit, forPath };
};

/**
 * Singleton emitter instance. No-ops in production builds since
 * Metro strips `__DEV__` branches at compile time.
 */
const noopEmitter: LiveEmitter = {
  emit: () => {},
  forPath: () => () => {},
};

export const devEmitter: LiveEmitter = __DEV__
  ? createDevLiveEmitter()
  : noopEmitter;

export type { LiveEmitter, ScopedEmitter, LiveEventPayload };
