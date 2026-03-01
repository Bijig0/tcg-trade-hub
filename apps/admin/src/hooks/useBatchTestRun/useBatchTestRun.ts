/**
 * Hook for batch Maestro test execution with WebSocket progress streaming.
 *
 * Provides:
 * - `runAll()` / `runFailed()` mutation triggers
 * - `isBatchRunning` / `batchProgress` for UI state
 * - `scenarioProgress` per-scenario phase/status from WebSocket
 * - `scenarioLastPassed` timestamps from cached test runs
 */
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { graphOrpc, graphClient } from '@/lib/graphOrpc';
import { recordingKeys } from '@/hooks/useRecording/useRecording';

const GRAPH_WS_URL = 'ws://localhost:4243/ws/live';

type BatchProgressEvent = {
  type: 'batch-progress';
  batchId: string;
  scenarioId: string;
  phase: 'hash-check' | 'testing' | 'recording' | 'done';
  status: 'running' | 'passed' | 'failed' | 'cached';
  message: string;
  progress: number;
};

type ScenarioProgressEntry = {
  phase: BatchProgressEvent['phase'];
  status: BatchProgressEvent['status'];
  message: string;
};

const useBatchTestRun = () => {
  const queryClient = useQueryClient();
  const [isBatchRunning, setIsBatchRunning] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);
  const [scenarioProgress, setScenarioProgress] = useState<
    Record<string, ScenarioProgressEntry>
  >({});
  const wsRef = useRef<WebSocket | null>(null);

  // Fetch cached test run results
  const { data: testRuns } = useQuery({
    ...graphOrpc.maestro.testRuns.queryOptions(),
    refetchInterval: isBatchRunning ? 5_000 : 30_000,
  });

  // Derive scenarioLastPassed map
  const scenarioLastPassed = useMemo(() => {
    const map: Record<string, string> = {};
    for (const run of testRuns ?? []) {
      if (run.status === 'passed') {
        map[run.scenarioId] = run.createdAt;
      }
    }
    return map;
  }, [testRuns]);

  // WebSocket listener for batch progress events
  useEffect(() => {
    if (!isBatchRunning) return;

    const ws = new WebSocket(GRAPH_WS_URL);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data as string) as Record<string, unknown>;
        if (data.type !== 'batch-progress') return;

        const progressEvent = data as unknown as BatchProgressEvent;
        setBatchProgress(progressEvent.progress);
        setScenarioProgress((prev) => ({
          ...prev,
          [progressEvent.scenarioId]: {
            phase: progressEvent.phase,
            status: progressEvent.status,
            message: progressEvent.message,
          },
        }));
      } catch {
        // Ignore non-JSON or non-batch messages
      }
    };

    ws.onerror = () => { /* noop */ };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [isBatchRunning]);

  // Batch run mutation
  //
  // The request is long-running (~minutes). We open the WS *before* calling
  // the mutation so progress events stream in from the start. On completion
  // (or error / already-running), we tear the WS down.
  const batchMutation = useMutation({
    mutationFn: async (mode: 'all' | 'failed-only') => {
      // Open WS + set running state synchronously so progress events arrive
      // before the first scenario even starts.
      setIsBatchRunning(true);
      setBatchProgress(0);
      setScenarioProgress({});

      const result = await graphClient.maestro.batchRun({ mode });

      // If the server says "already running", treat as a no-op
      if (!result.ok) {
        throw new Error(result.error);
      }
      return result;
    },
    onSettled: () => {
      setIsBatchRunning(false);
      queryClient.invalidateQueries({ queryKey: recordingKeys.all });
      queryClient.invalidateQueries({
        queryKey: graphOrpc.maestro.testRuns.queryOptions().queryKey,
      });
    },
  });

  const runAll = useCallback(() => {
    batchMutation.mutate('all');
  }, [batchMutation]);

  const runFailed = useCallback(() => {
    batchMutation.mutate('failed-only');
  }, [batchMutation]);

  return {
    isBatchRunning,
    batchProgress,
    scenarioProgress,
    scenarioLastPassed,
    runAll,
    runFailed,
    testRuns: testRuns ?? [],
  };
};

export default useBatchTestRun;
export type { ScenarioProgressEntry, BatchProgressEvent };
