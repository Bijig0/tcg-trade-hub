import { createFileRoute } from '@tanstack/react-router';
import { GraphViewer } from 'flow-graph/react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { ChatPanel } from '@/features/chat';

const GRAPH_SERVER_URL = 'http://localhost:4243';
const HEALTH_POLL_INTERVAL = 5_000;
const INITIAL_RETRY_DELAY = 1_000;
const MAX_RETRY_DELAY = 10_000;

type ServerStatus = 'connecting' | 'healthy' | 'unhealthy';

type HealthData = {
  status: ServerStatus;
  pathCount: number | null;
  entryCount: number | null;
  lastChecked: number | null;
  error: string | null;
};

const useGraphHealth = () => {
  const [health, setHealth] = useState<HealthData>({
    status: 'connecting',
    pathCount: null,
    entryCount: null,
    lastChecked: null,
    error: null,
  });
  const retryDelay = useRef(INITIAL_RETRY_DELAY);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const checkHealth = useCallback(async () => {
    try {
      const [pathsRes, registryRes] = await Promise.all([
        fetch(`${GRAPH_SERVER_URL}/api/paths`, { signal: AbortSignal.timeout(4_000) }),
        fetch(`${GRAPH_SERVER_URL}/api/registry`, { signal: AbortSignal.timeout(4_000) }),
      ]);

      if (!pathsRes.ok || !registryRes.ok) {
        throw new Error(`Server responded with ${pathsRes.status}/${registryRes.status}`);
      }

      const paths = (await pathsRes.json()) as unknown[];
      const entries = (await registryRes.json()) as unknown[];

      retryDelay.current = INITIAL_RETRY_DELAY;
      setHealth({
        status: 'healthy',
        pathCount: paths.length,
        entryCount: entries.length,
        lastChecked: Date.now(),
        error: null,
      });
    } catch (err) {
      const message =
        err instanceof TypeError
          ? 'Graph server is not running. Start it with: pnpm dev:admin'
          : err instanceof DOMException && err.name === 'TimeoutError'
            ? 'Graph server timed out — it may be overloaded'
            : `Connection failed: ${(err as Error).message}`;

      setHealth((prev) => ({
        ...prev,
        status: 'unhealthy',
        lastChecked: Date.now(),
        error: message,
      }));

      retryDelay.current = Math.min(retryDelay.current * 1.5, MAX_RETRY_DELAY);
    }
  }, []);

  const retry = useCallback(() => {
    setHealth((prev) => ({ ...prev, status: 'connecting', error: null }));
    retryDelay.current = INITIAL_RETRY_DELAY;
    checkHealth();
  }, [checkHealth]);

  useEffect(() => {
    checkHealth();

    const poll = () => {
      timerRef.current = setTimeout(() => {
        checkHealth().then(() => poll());
      }, HEALTH_POLL_INTERVAL);
    };
    poll();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [checkHealth]);

  return { health, retry };
};

export const Route = createFileRoute('/')({
  component: AdminHome,
});

function AdminHome() {
  const { health, retry } = useGraphHealth();
  const [isChatOpen, setIsChatOpen] = useState(false);

  const toggleChat = useCallback(() => {
    setIsChatOpen((prev) => !prev);
    // Trigger resize so Cytoscape reflows to fit the new container width
    requestAnimationFrame(() => {
      window.dispatchEvent(new Event('resize'));
    });
  }, []);

  if (health.status === 'connecting') {
    return <ConnectingState />;
  }

  if (health.status === 'unhealthy') {
    return <ErrorState error={health.error!} onRetry={retry} />;
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <HealthBar health={health} onRetry={retry} />
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-hidden">
          <GraphViewer
            serverUrl={GRAPH_SERVER_URL}
            height="calc(100dvh - 41px)"
          />
        </div>
        <ChatPanel isOpen={isChatOpen} onToggle={toggleChat} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const ConnectingState = () => (
  <div className="flex h-screen items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-primary" />
      <p className="text-lg font-medium text-foreground">
        Connecting to graph server...
      </p>
      <p className="text-sm text-muted-foreground">
        {GRAPH_SERVER_URL}
      </p>
    </div>
  </div>
);

type ErrorStateProps = { error: string; onRetry: () => void };

const ErrorState = ({ error, onRetry }: ErrorStateProps) => (
  <div className="flex h-screen items-center justify-center bg-background">
    <div className="mx-4 w-full max-w-lg rounded-xl border border-border bg-card p-8 shadow-lg">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
          <svg
            className="h-5 w-5 text-destructive"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-foreground">
          Graph Server Unavailable
        </h2>
      </div>

      <p className="mb-4 text-sm text-muted-foreground">{error}</p>

      <div className="mb-6 rounded-lg border border-border bg-secondary/50 p-4">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Quick fix
        </p>
        <code className="block text-sm text-foreground">pnpm dev:admin</code>
        <p className="mt-2 text-xs text-muted-foreground">
          This syncs the graph DB, starts the graph server on :4243, and launches this admin UI.
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onRetry}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Retry Connection
        </button>
        <a
          href={`${GRAPH_SERVER_URL}/api/paths`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
        >
          Check Server Directly
        </a>
      </div>
    </div>
  </div>
);

type HealthBarProps = { health: HealthData; onRetry: () => void };

const HealthBar = ({ health, onRetry }: HealthBarProps) => {
  const isStale =
    health.lastChecked !== null &&
    Date.now() - health.lastChecked > HEALTH_POLL_INTERVAL * 3;

  return (
    <div className="flex items-center justify-between border-b border-border bg-card px-4 py-2">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-foreground">
          TCG Trade Hub — Admin
        </span>
        <span className="text-xs text-muted-foreground">|</span>
        <div className="flex items-center gap-1.5">
          <span
            className={`inline-block h-2 w-2 rounded-full ${
              isStale
                ? 'bg-yellow-500'
                : health.status === 'healthy'
                  ? 'bg-success'
                  : 'bg-destructive'
            }`}
          />
          <span className="text-xs text-muted-foreground">
            {isStale ? 'Stale' : health.status === 'healthy' ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {health.pathCount !== null && (
          <span className="text-xs text-muted-foreground">
            {health.pathCount} paths / {health.entryCount} entries
          </span>
        )}
        {health.lastChecked && (
          <span className="text-xs text-muted-foreground">
            checked {formatAgo(health.lastChecked)}
          </span>
        )}
        {health.status !== 'healthy' && (
          <button
            onClick={onRetry}
            className="rounded bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground transition-colors hover:bg-accent"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
};

const formatAgo = (ts: number): string => {
  const seconds = Math.round((Date.now() - ts) / 1000);
  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  return `${Math.round(seconds / 60)}m ago`;
};
