import { useCallback, useEffect, useRef, useState } from 'react';

const WS_URL = 'ws://localhost:4243/ws/live';
const RECONNECT_DELAY = 3_000;

type MobileLinkEvent = {
  pathId: string;
  message: string;
  timestamp: number;
};

type UseMobileLinkReturn = {
  isLinked: boolean;
  toggleLink: () => void;
  activePath: string | null;
  lastEvent: MobileLinkEvent | null;
  connected: boolean;
};

/**
 * Hook that connects to the graph server WebSocket and listens for
 * mobile navigation events (`caller: "mobile:nav"`).
 *
 * When linked, exposes the latest `pathId` so the dashboard can
 * drive the GraphViewer in controlled mode.
 */
const useMobileLink = (): UseMobileLinkReturn => {
  const [isLinked, setIsLinked] = useState(false);
  const [connected, setConnected] = useState(false);
  const [activePath, setActivePath] = useState<string | null>(null);
  const [lastEvent, setLastEvent] = useState<MobileLinkEvent | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const cleanup = useCallback(() => {
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

  const connect = useCallback(() => {
    cleanup();

    let ws: WebSocket;
    try {
      ws = new WebSocket(WS_URL);
    } catch {
      setConnected(false);
      reconnectTimer.current = setTimeout(connect, RECONNECT_DELAY);
      return;
    }

    ws.onopen = () => setConnected(true);

    ws.onclose = () => {
      setConnected(false);
      reconnectTimer.current = setTimeout(connect, RECONNECT_DELAY);
    };

    ws.onerror = () => setConnected(false);

    ws.onmessage = (msg) => {
      try {
        const event = JSON.parse(String(msg.data)) as {
          pathId?: string;
          caller?: string;
          message?: string;
          timestamp?: number;
        };

        // Only act on mobile navigation events
        if (event.caller !== 'mobile:nav' || !event.pathId) return;

        const parsed: MobileLinkEvent = {
          pathId: event.pathId,
          message: event.message ?? event.pathId,
          timestamp: event.timestamp ?? Date.now(),
        };

        setActivePath(parsed.pathId);
        setLastEvent(parsed);
      } catch {
        /* ignore parse errors */
      }
    };

    wsRef.current = ws;
  }, [cleanup]);

  useEffect(() => {
    if (isLinked) {
      connect();
    } else {
      cleanup();
      setActivePath(null);
      setLastEvent(null);
    }

    return cleanup;
  }, [isLinked, connect, cleanup]);

  const toggleLink = useCallback(() => {
    setIsLinked((prev) => !prev);
  }, []);

  return { isLinked, toggleLink, activePath, lastEvent, connected };
};

export default useMobileLink;
