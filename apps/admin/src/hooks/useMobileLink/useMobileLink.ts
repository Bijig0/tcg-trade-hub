import { useCallback, useEffect, useRef, useState } from 'react';
import { z } from 'zod';

const GRAPH_SERVER_URL = 'http://localhost:4243';
const WS_URL = 'ws://localhost:4243/ws/live';
const RECONNECT_DELAY = 3_000;
const UDID_PATTERN = /^[0-9A-F-]{36}$/i;

// ---- Zod schemas ----

const SimulatorSchema = z.object({
  udid: z.string().min(1),
  name: z.string().min(1),
  state: z.enum(['Booted', 'Shutdown', 'Shutting Down']),
  runtime: z.string(),
});

export type Simulator = z.infer<typeof SimulatorSchema>;

const SimulatorListSchema = z.array(SimulatorSchema);

const ErrorResponseSchema = z.object({
  error: z.string(),
});

const MobileLinkEventSchema = z.object({
  pathId: z.string().min(1),
  caller: z.literal('mobile:nav'),
  message: z.string().optional(),
  timestamp: z.number().optional(),
});

type MobileLinkEvent = {
  pathId: string;
  message: string;
  timestamp: number;
};

const extractErrorMessage = (err: unknown): string => {
  if (err instanceof Error) return err.message;
  return String(err);
};

type UseMobileLinkReturn = {
  simulators: Simulator[];
  isLoadingSimulators: boolean;
  refreshSimulators: () => void;
  simulatorError: string | null;

  linkedSimulator: Simulator | null;
  linkTo: (udid: string) => void;
  unlink: () => void;
  isBooting: boolean;

  activePath: string | null;
  lastEvent: MobileLinkEvent | null;
  connected: boolean;
};

/**
 * Hook that manages simulator selection and WebSocket connection
 * to the graph server for mobile navigation events.
 *
 * Fetches available iOS simulators, boots them on demand, and
 * listens for `caller: "mobile:nav"` events over WebSocket.
 */
const useMobileLink = (): UseMobileLinkReturn => {
  // Simulator list state
  const [simulators, setSimulators] = useState<Simulator[]>([]);
  const [isLoadingSimulators, setIsLoadingSimulators] = useState(false);
  const [simulatorError, setSimulatorError] = useState<string | null>(null);

  // Link state
  const [linkedSimulator, setLinkedSimulator] = useState<Simulator | null>(null);
  const [isBooting, setIsBooting] = useState(false);

  // WebSocket state
  const [connected, setConnected] = useState(false);
  const [activePath, setActivePath] = useState<string | null>(null);
  const [lastEvent, setLastEvent] = useState<MobileLinkEvent | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // ---- Fetch simulators ----

  const fetchSimulators = useCallback(async () => {
    setIsLoadingSimulators(true);
    setSimulatorError(null);
    try {
      const res = await fetch(`${GRAPH_SERVER_URL}/api/simulators`, {
        signal: AbortSignal.timeout(5_000),
      });
      if (!res.ok) {
        const body = ErrorResponseSchema.safeParse(await res.json().catch(() => null));
        throw new Error(body.success ? body.data.error : `HTTP ${res.status}`);
      }
      const raw = await res.json();
      const devices = SimulatorListSchema.parse(raw);
      setSimulators(devices);
    } catch (err) {
      const message =
        err instanceof TypeError
          ? 'Cannot reach graph server'
          : extractErrorMessage(err);
      setSimulatorError(message);
      setSimulators([]);
    } finally {
      setIsLoadingSimulators(false);
    }
  }, []);

  const refreshSimulators = useCallback(() => {
    fetchSimulators();
  }, [fetchSimulators]);

  // Fetch on mount
  useEffect(() => {
    fetchSimulators();
  }, [fetchSimulators]);

  // ---- WebSocket management ----

  const cleanupWs = useCallback(() => {
    clearTimeout(reconnectTimer.current);
    reconnectTimer.current = undefined;
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch {
        /* noop */
      }
      wsRef.current = null;
    }
    setConnected(false);
  }, []);

  const connectWs = useCallback(() => {
    cleanupWs();

    let ws: WebSocket;
    try {
      ws = new WebSocket(WS_URL);
    } catch {
      setConnected(false);
      reconnectTimer.current = setTimeout(connectWs, RECONNECT_DELAY);
      return;
    }

    ws.onopen = () => setConnected(true);

    ws.onclose = () => {
      setConnected(false);
      reconnectTimer.current = setTimeout(connectWs, RECONNECT_DELAY);
    };

    ws.onerror = () => setConnected(false);

    ws.onmessage = (msg) => {
      try {
        const raw = JSON.parse(String(msg.data));
        const result = MobileLinkEventSchema.safeParse(raw);
        if (!result.success) return;

        const parsed: MobileLinkEvent = {
          pathId: result.data.pathId,
          message: result.data.message ?? result.data.pathId,
          timestamp: result.data.timestamp ?? Date.now(),
        };

        setActivePath(parsed.pathId);
        setLastEvent(parsed);
      } catch {
        /* ignore parse errors */
      }
    };

    wsRef.current = ws;
  }, [cleanupWs]);

  // ---- Link / Unlink ----

  const linkTo = useCallback(
    async (udid: string) => {
      if (!UDID_PATTERN.test(udid)) {
        setSimulatorError('Invalid simulator UDID');
        return;
      }

      const sim = simulators.find((s) => s.udid === udid);
      if (!sim) return;

      setIsBooting(true);
      try {
        const res = await fetch(`${GRAPH_SERVER_URL}/api/simulators/${udid}/boot`, {
          method: 'POST',
          signal: AbortSignal.timeout(30_000),
        });
        if (!res.ok) {
          const body = ErrorResponseSchema.safeParse(await res.json().catch(() => null));
          throw new Error(body.success ? body.data.error : `HTTP ${res.status}`);
        }

        setLinkedSimulator({ ...sim, state: 'Booted' });
        connectWs();
      } catch (err) {
        setSimulatorError(`Boot failed: ${extractErrorMessage(err)}`);
      } finally {
        setIsBooting(false);
      }
    },
    [simulators, connectWs],
  );

  const unlink = useCallback(() => {
    cleanupWs();
    setLinkedSimulator(null);
    setActivePath(null);
    setLastEvent(null);
  }, [cleanupWs]);

  // Cleanup WS on unmount
  useEffect(() => cleanupWs, [cleanupWs]);

  return {
    simulators,
    isLoadingSimulators,
    refreshSimulators,
    simulatorError,
    linkedSimulator,
    linkTo,
    unlink,
    isBooting,
    activePath,
    lastEvent,
    connected,
  };
};

export default useMobileLink;
