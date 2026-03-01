import { createFileRoute } from '@tanstack/react-router';
import { GraphViewer } from 'flow-graph/react';
import type { ScenarioStatus, ScenarioErrorInfo, MaestroSetupStatus } from 'flow-graph/react';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { graphOrpc, graphClient } from '@/lib/graphOrpc';
import { ChatPanel } from '@/features/chat';
import TestCoverage from '@/features/maestro/components/TestCoverage/TestCoverage';
import RecordingModal from '@/features/maestro/components/RecordingModal/RecordingModal';
import useMobileLink from '@/hooks/useMobileLink/useMobileLink';
import { useRecording, useRecordingList, recordingKeys } from '@/hooks/useRecording/useRecording';
import useBatchTestRun from '@/hooks/useBatchTestRun/useBatchTestRun';
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

const useMaestroHealth = (enabled: boolean) => {
  const { data } = useQuery({
    ...graphOrpc.maestro.health.queryOptions(),
    enabled,
    refetchInterval: 30_000,
  });

  const setupStatus: MaestroSetupStatus = !data
    ? 'checking'
    : !data.maestroInstalled
      ? 'maestro-missing'
      : !data.simulatorBooted
        ? 'no-simulator'
        : 'ready';

  return { maestroHealth: data ?? null, setupStatus };
};

export const Route = createFileRoute('/_authed/dashboard')({
  component: AdminDashboard,
});

type ScenarioConfig = {
  id: string;
  label: string;
  description: string;
  parentPathId: string;
  stepIndices: number[];
  testFile: string | null;
};

function AdminDashboard() {
  const { health, retry } = useGraphHealth();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isTestCoverageOpen, setIsTestCoverageOpen] = useState(false);
  const [recordingPathId, setRecordingPathId] = useState<string | null>(null);
  const mobileLink = useMobileLink();
  const { maestroHealth, setupStatus } = useMaestroHealth(health.status === 'healthy');

  // Scenarios
  const { data: scenariosList } = useQuery({
    queryKey: ['scenarios'],
    queryFn: async () => {
      const res = await fetch(`${GRAPH_SERVER_URL}/api/scenarios`);
      if (!res.ok) return [] as ScenarioConfig[];
      const data = await res.json();
      return Array.isArray(data) ? (data as ScenarioConfig[]) : [];
    },
    enabled: health.status === 'healthy',
  });

  const scenariosByPath = useMemo(() => {
    const map: Record<string, ScenarioConfig[]> = {};
    for (const s of scenariosList ?? []) {
      (map[s.parentPathId] ??= []).push(s);
    }
    return map;
  }, [scenariosList]);

  // Recordings
  const queryClient = useQueryClient();
  const { data: recordingsList } = useRecordingList();
  const recordedIds = useMemo(
    () => new Set(recordingsList?.map((r) => r.pathId) ?? []),
    [recordingsList],
  );
  const {
    recording,
    videoUrl,
    triggerRecord,
    isRecording,
    recordError,
    deleteRecording: deleteRec,
    isDeleting,
  } = useRecording(recordingPathId);

  // --- Batch test run ---
  const batch = useBatchTestRun();

  // --- Scenario run orchestration ---
  const [runningScenarioId, setRunningScenarioId] = useState<string | null>(null);
  const [scenarioErrors, setScenarioErrors] = useState<Record<string, ScenarioErrorInfo>>({});

  const runMutation = useMutation({
    mutationFn: async (scenarioId: string) => {
      const result = await graphClient.maestro.record({ pathId: scenarioId });
      if (!result.ok) {
        const err = new Error(result.error) as Error & { code: string; hint: string };
        err.code = result.code;
        err.hint = result.hint;
        throw err;
      }
      return result.recording;
    },
    onMutate: (scenarioId) => {
      setRunningScenarioId(scenarioId);
      // Clear any previous error for this scenario
      setScenarioErrors((prev) => {
        if (!prev[scenarioId]) return prev;
        const next = { ...prev };
        delete next[scenarioId];
        return next;
      });
    },
    onSuccess: () => {
      setRunningScenarioId(null);
      queryClient.invalidateQueries({ queryKey: recordingKeys.all });
    },
    onError: (err, scenarioId) => {
      setRunningScenarioId(null);
      const enriched = err as Error & { code?: string; hint?: string };
      setScenarioErrors((prev) => ({
        ...prev,
        [scenarioId]: {
          message: enriched.message ?? 'Unknown error',
          code: enriched.code ?? 'UNKNOWN',
          hint: enriched.hint ?? '',
        },
      }));
    },
  });

  // Derive per-scenario statuses (batch progress takes priority)
  const scenarioStatuses = useMemo(() => {
    const map: Record<string, ScenarioStatus> = {};
    for (const scenarios of Object.values(scenariosByPath)) {
      for (const s of scenarios) {
        // Batch progress events override everything when batch is running
        const batchEntry = batch.scenarioProgress[s.id];
        if (batchEntry) {
          if (batchEntry.phase === 'testing') {
            map[s.id] = 'testing';
            continue;
          }
          if (batchEntry.phase === 'recording') {
            map[s.id] = 'recording';
            continue;
          }
          if (batchEntry.phase === 'done' && batchEntry.status === 'cached') {
            map[s.id] = 'cached';
            continue;
          }
          if (batchEntry.phase === 'done' && batchEntry.status === 'passed') {
            map[s.id] = 'cached';
            continue;
          }
          if (batchEntry.phase === 'done' && batchEntry.status === 'failed') {
            map[s.id] = 'error';
            if (!scenarioErrors[s.id]) {
              // Batch runner reported failure but we don't have an error object yet
              // The error message is in batchEntry.message
            }
            continue;
          }
          if (batchEntry.phase === 'hash-check') {
            map[s.id] = 'batch-queued';
            continue;
          }
        }

        // When batch is running but this scenario hasn't been reached yet
        if (batch.isBatchRunning && !batchEntry) {
          map[s.id] = 'batch-queued';
          continue;
        }

        // Regular status derivation
        if (s.id === runningScenarioId) {
          map[s.id] = 'running';
        } else if (scenarioErrors[s.id]) {
          map[s.id] = 'error';
        } else if (batch.scenarioLastPassed[s.id]) {
          map[s.id] = 'cached';
        } else if (recordedIds.has(s.id)) {
          map[s.id] = 'recorded';
        } else {
          map[s.id] = 'idle';
        }
      }
    }
    return map;
  }, [scenariosByPath, runningScenarioId, scenarioErrors, recordedIds, batch.scenarioProgress, batch.isBatchRunning, batch.scenarioLastPassed]);

  const handleRunScenario = useCallback((scenarioId: string) => {
    runMutation.mutate(scenarioId);
  }, [runMutation]);

  const handleRerunScenario = useCallback((scenarioId: string) => {
    runMutation.mutate(scenarioId);
  }, [runMutation]);

  const toggleChat = useCallback(() => {
    setIsChatOpen((prev) => !prev);
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

  const handlePlayRecording = useCallback((scenarioId: string) => {
    setRecordingPathId(scenarioId);
  }, []);

  const handleCloseRecording = useCallback(() => {
    setRecordingPathId(null);
  }, []);

  if (health.status === 'connecting') {
    return <ConnectingState />;
  }

  if (health.status === 'unhealthy') {
    return <ErrorState error={health.error!} onRetry={retry} />;
  }

  // Use the first active path for controlled graph navigation (graph focuses on one path)
  const firstActive = mobileLink.linkedSimulator && mobileLink.activePaths.length > 0
    ? mobileLink.activePaths[0]
    : null;
  const controlledPath = firstActive?.pathId;
  const controlledStep = firstActive?.stepIndex;

  // All active path IDs for pill indicators
  const mobileActivePaths = mobileLink.linkedSimulator && mobileLink.activePaths.length > 0
    ? mobileLink.activePaths.map((p) => p.pathId)
    : undefined;

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <HealthBar
        health={health}
        onRetry={retry}
        onToggleTestCoverage={toggleTestCoverage}
        mobileLink={mobileLink}
        maestroHealth={maestroHealth}
        maestroSetupStatus={setupStatus}
      />
      <div className="flex flex-1 overflow-hidden">
        <TestCoverage isOpen={isTestCoverageOpen} onToggle={toggleTestCoverage} />
        <div className="flex-1 overflow-hidden">
          <GraphViewer
            serverUrl={GRAPH_SERVER_URL}
            height="calc(100dvh - 41px)"
            activePath={controlledPath}
            activeStep={controlledStep}
            mobileActivePaths={mobileActivePaths}
            deviceName={mobileLink.linkedSimulator?.name ?? null}
            scenarios={scenariosByPath}
            scenarioStatuses={scenarioStatuses}
            scenarioErrors={scenarioErrors}
            onRunScenario={handleRunScenario}
            onPlayScenarioRecording={handlePlayRecording}
            onRerunScenario={handleRerunScenario}
            setupStatus={setupStatus}
            scenarioLastPassed={batch.scenarioLastPassed}
            onRunAll={batch.runAll}
            onRunFailed={batch.runFailed}
            isBatchRunning={batch.isBatchRunning}
            batchProgress={batch.batchProgress}
            batchLogs={batch.batchLogs}
            scenarioMessages={batch.scenarioMessages}
          />
        </div>
        <ChatPanel isOpen={isChatOpen} onToggle={toggleChat} />
      </div>

      {/* Recording playback modal */}
      {recordingPathId && (
        <RecordingModal
          isOpen={!!recordingPathId}
          onClose={handleCloseRecording}
          pathId={recordingPathId}
          recording={recording}
          videoUrl={videoUrl}
          isRecording={isRecording}
          onTriggerRecord={triggerRecord}
          onDelete={deleteRec}
          isDeleting={isDeleting}
          recordError={recordError}
        />
      )}
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

type MaestroHealthData = {
  maestroInstalled: boolean;
  maestroVersion: string | null;
  simulatorBooted: boolean;
  simulatorName: string | null;
} | null;

type HealthBarProps = {
  health: HealthData;
  onRetry: () => void;
  onToggleTestCoverage?: () => void;
  mobileLink?: MobileLinkState;
  maestroHealth?: MaestroHealthData;
  maestroSetupStatus?: MaestroSetupStatus;
};

const HealthBar = ({ health, onRetry, onToggleTestCoverage, mobileLink, maestroHealth, maestroSetupStatus }: HealthBarProps) => {
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
        <span className="text-xs text-muted-foreground">|</span>
        <MaestroIndicator status={maestroSetupStatus} health={maestroHealth} />
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
// Maestro Indicator
// ---------------------------------------------------------------------------

const MaestroIcon = () => (
  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-2.625 0V5.625m0 12.75v-12.75A1.125 1.125 0 014.5 4.5h15a1.125 1.125 0 011.125 1.125v12.75M3.375 19.5h17.25m0 0a1.125 1.125 0 001.125-1.125m-18.375 0h18.375m-18.375 0V5.625m18.375 12.75V5.625m0 0A1.125 1.125 0 0019.5 4.5h-15a1.125 1.125 0 00-1.125 1.125m17.25 0v12.75" />
  </svg>
);

type MaestroIndicatorProps = {
  status?: MaestroSetupStatus;
  health?: MaestroHealthData;
};

const MaestroIndicator = ({ status, health }: MaestroIndicatorProps) => {
  if (!status || status === 'checking') {
    return (
      <div className="flex items-center gap-1.5">
        <MaestroIcon />
        <div className="h-1.5 w-1.5 animate-spin rounded-full border border-muted-foreground border-t-transparent" />
        <span className="text-xs text-muted-foreground">Maestro</span>
      </div>
    );
  }

  if (status === 'maestro-missing') {
    return (
      <div className="flex items-center gap-1.5" title="Maestro CLI not installed. Run: curl -Ls &quot;https://get.maestro.mobile.dev&quot; | bash">
        <MaestroIcon />
        <span className="inline-block h-2 w-2 rounded-full bg-destructive" />
        <span className="text-xs text-destructive">Not installed</span>
      </div>
    );
  }

  if (status === 'no-simulator') {
    return (
      <div className="flex items-center gap-1.5" title="Maestro installed but no iOS simulator is booted">
        <MaestroIcon />
        <span className="inline-block h-2 w-2 rounded-full bg-yellow-500" />
        <span className="text-xs text-yellow-600 dark:text-yellow-400">
          {health?.maestroVersion ? `v${health.maestroVersion}` : 'Installed'} — no simulator
        </span>
      </div>
    );
  }

  // ready
  return (
    <div className="flex items-center gap-1.5" title={`Maestro ${health?.maestroVersion ?? ''} connected to ${health?.simulatorName ?? 'simulator'}`}>
      <MaestroIcon />
      <span className="inline-block h-2 w-2 rounded-full bg-success" />
      <span className="text-xs text-muted-foreground">
        Maestro {health?.maestroVersion ? `v${health.maestroVersion}` : ''}
      </span>
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

  // ---- Linked state: show device name + active paths + unlink button ----
  if (mobileLink.linkedSimulator) {
    const pathCount = mobileLink.activePaths.length;

    return (
      <div className="flex items-center gap-2">
        <PhoneIcon />
        <span
          className={`inline-block h-1.5 w-1.5 rounded-full ${
            mobileLink.connected ? 'bg-green-500' : 'bg-muted-foreground'
          }`}
        />
        <span className="text-xs font-semibold text-primary" title={`UDID: ${mobileLink.linkedSimulator.udid.slice(0, 8)}...`}>
          {mobileLink.linkedSimulator.name}
        </span>
        {pathCount > 0 && (
          <span className="rounded-full bg-green-500/15 px-1.5 py-0.5 text-[10px] font-medium text-green-600 dark:text-green-400">
            {pathCount} {pathCount === 1 ? 'path' : 'paths'} active
          </span>
        )}
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
