import { createFileRoute } from '@tanstack/react-router';
import { GraphViewer } from 'flow-graph/react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { ChatPanel } from '@/features/chat';
import TestCoverage from '@/features/maestro/components/TestCoverage/TestCoverage';
import useMobileLink from '@/hooks/useMobileLink/useMobileLink';
import type { Simulator } from '@/hooks/useMobileLink/useMobileLink';

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

export const Route = createFileRoute('/_authed/dashboard')({
  component: AdminDashboard,
});

function AdminDashboard() {
  const { health, retry } = useGraphHealth();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isTestCoverageOpen, setIsTestCoverageOpen] = useState(false);
  const mobileLink = useMobileLink();

  const toggleChat = useCallback(() => {
    setIsChatOpen((prev) => !prev);
    // Trigger resize so Cytoscape reflows to fit the new container width
    requestAnimationFrame(() => {
      window.dispatchEvent(new Event('resize'));
    });
  }, []);

  const toggleTestCoverage = useCallback(() => {
    setIsTestCoverageOpen((prev) => !prev);
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

  const controlledPath =
    mobileLink.linkedSimulator && mobileLink.activePath ? mobileLink.activePath : undefined;

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <HealthBar
        health={health}
        onRetry={retry}
        onToggleTestCoverage={toggleTestCoverage}
        mobileLink={mobileLink}
      />
      <div className="flex flex-1 overflow-hidden">
        <TestCoverage isOpen={isTestCoverageOpen} onToggle={toggleTestCoverage} />
        <div className="flex-1 overflow-hidden">
          <GraphViewer
            serverUrl={GRAPH_SERVER_URL}
            height="calc(100dvh - 41px)"
            activePath={controlledPath}
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

type MobileLinkState = ReturnType<typeof useMobileLink>;

type HealthBarProps = {
  health: HealthData;
  onRetry: () => void;
  onToggleTestCoverage?: () => void;
  mobileLink?: MobileLinkState;
};

const HealthBar = ({ health, onRetry, onToggleTestCoverage, mobileLink }: HealthBarProps) => {
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
        {mobileLink && (
          <>
            <span className="text-xs text-muted-foreground">|</span>
            <SimulatorDropdown mobileLink={mobileLink} />
          </>
        )}
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
        {onToggleTestCoverage && (
          <button
            onClick={onToggleTestCoverage}
            className="rounded bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground transition-colors hover:bg-accent"
            title="Toggle Maestro test coverage panel"
          >
            E2E Coverage
          </button>
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

// ---------------------------------------------------------------------------
// Simulator Dropdown
// ---------------------------------------------------------------------------

type SimulatorDropdownProps = {
  mobileLink: MobileLinkState;
};

const PhoneIcon = () => (
  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
    />
  </svg>
);

const SimulatorDropdown = ({ mobileLink }: SimulatorDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSelectSimulator = (udid: string) => {
    mobileLink.linkTo(udid);
    setIsOpen(false);
  };

  // ---- Linked state: show device name + unlink button ----
  if (mobileLink.linkedSimulator) {
    return (
      <div className="flex items-center gap-1.5">
        <span
          className={`inline-block h-1.5 w-1.5 rounded-full ${
            mobileLink.connected ? 'bg-green-500' : 'bg-muted-foreground'
          }`}
        />
        <span className="text-xs font-medium text-primary" title={`UDID: ${mobileLink.linkedSimulator.udid.slice(0, 8)}...`}>
          {mobileLink.linkedSimulator.name}
        </span>
        {mobileLink.lastEvent && (
          <span className="text-xs text-muted-foreground">
            — {mobileLink.lastEvent.message}
          </span>
        )}
        <button
          onClick={mobileLink.unlink}
          className="ml-1 rounded p-0.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          title="Unlink simulator"
        >
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    );
  }

  // ---- Unlinked state: button + dropdown ----
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => {
          setIsOpen((prev) => !prev);
          if (!isOpen) mobileLink.refreshSimulators();
        }}
        className="flex items-center gap-1.5 rounded bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground transition-colors hover:bg-accent"
        title="Select a simulator to link"
      >
        <PhoneIcon />
        {mobileLink.isBooting ? 'Booting...' : 'Link to Mobile'}
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1 w-64 rounded-lg border border-border bg-card shadow-lg">
          {mobileLink.isLoadingSimulators ? (
            <div className="flex items-center justify-center px-3 py-4">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-primary" />
              <span className="ml-2 text-xs text-muted-foreground">Loading simulators...</span>
            </div>
          ) : mobileLink.simulatorError || mobileLink.simulators.length === 0 ? (
            <div className="px-3 py-4 text-center">
              <p className="text-xs text-muted-foreground">
                {mobileLink.simulatorError ?? 'No simulators available'}
              </p>
              <button
                onClick={() => mobileLink.refreshSimulators()}
                className="mt-2 rounded bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground transition-colors hover:bg-accent"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              <ul className="max-h-48 overflow-y-auto py-1">
                {mobileLink.simulators.map((sim) => (
                  <SimulatorRow
                    key={sim.udid}
                    simulator={sim}
                    isBooting={mobileLink.isBooting}
                    onSelect={handleSelectSimulator}
                  />
                ))}
              </ul>
              <div className="border-t border-border px-3 py-1.5">
                <button
                  onClick={() => mobileLink.refreshSimulators()}
                  className="flex w-full items-center gap-1.5 rounded px-1 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182"
                    />
                  </svg>
                  Refresh
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

type SimulatorRowProps = {
  simulator: Simulator;
  isBooting: boolean;
  onSelect: (udid: string) => void;
};

const SimulatorRow = ({ simulator, isBooting, onSelect }: SimulatorRowProps) => {
  const isBooted = simulator.state === 'Booted';

  return (
    <li>
      <button
        onClick={() => onSelect(simulator.udid)}
        disabled={isBooting}
        className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs transition-colors hover:bg-secondary disabled:opacity-50"
      >
        <span
          className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${
            isBooted ? 'bg-green-500' : 'bg-muted-foreground/40'
          }`}
        />
        <span className="flex-1 truncate font-medium text-foreground">
          {simulator.name}
        </span>
        <span className="shrink-0 text-muted-foreground">
          {isBooted ? 'Booted' : simulator.state}
        </span>
      </button>
    </li>
  );
};

const formatAgo = (ts: number): string => {
  const seconds = Math.round((Date.now() - ts) / 1000);
  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  return `${Math.round(seconds / 60)}m ago`;
};
