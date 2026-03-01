/**
 * Batch Maestro test runner with content-based caching.
 *
 * Single-phase execution per scenario:
 *   `maestro record <flow.yaml> <output.mp4>` — produces exit code + video
 *   Video is saved regardless of pass/fail so failures are visible.
 *
 * Results are cached in SQLite keyed on SHA-256 of flow file contents.
 * Subsequent runs skip scenarios whose flow files haven't changed.
 */
import { spawn, type ChildProcess } from "node:child_process";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { randomUUID } from "node:crypto";
import {
  getTestRunByHash,
  upsertTestRun,
  listLatestTestRuns,
  upsertRecording,
  type TestRunMeta,
} from "flow-graph";
import type Database from "better-sqlite3";
import { hashFlowFile } from "./flowHasher";
import { SCENARIO_TEST_MAP, parseMaestroError } from "./recordingRunner";
import { getScenarios, type ScenarioConfig } from "./scenarios";

const E2E_BASE = resolve(
  import.meta.dirname ?? __dirname,
  "../../../../apps/mobile/e2e/flows",
);

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type BatchMode = "all" | "failed-only";

type BatchProgressEvent = {
  type: "batch-progress";
  batchId: string;
  scenarioId: string;
  phase: "hash-check" | "recording" | "done";
  status: "running" | "passed" | "failed" | "cached";
  message: string;
  progress: number; // 0-1
};

type BatchResult = {
  batchId: string;
  total: number;
  passed: number;
  failed: number;
  cached: number;
  durationMs: number;
};

type BatchOptions = {
  mode: BatchMode;
  onProgress?: (event: BatchProgressEvent) => void;
};

// ---------------------------------------------------------------------------
// Process registry — tracks spawned child processes for cleanup
// ---------------------------------------------------------------------------

const activeProcesses = new Set<ChildProcess>();

const killAllActiveProcesses = (): void => {
  for (const proc of activeProcesses) {
    try {
      proc.kill("SIGTERM");
    } catch {
      /* already dead */
    }
  }
  activeProcesses.clear();
};

// ---------------------------------------------------------------------------
// Timestamp-based liveness (replaces boolean flag)
// ---------------------------------------------------------------------------

let batchStartedAt: number | null = null;

const BATCH_STALENESS_MS = 15 * 60 * 1000; // 15 minutes

const isBatchRunning = (): boolean => {
  if (batchStartedAt === null) return false;
  if (Date.now() - batchStartedAt > BATCH_STALENESS_MS) {
    batchStartedAt = null;
    killAllActiveProcesses();
    return false;
  }
  return true;
};

// ---------------------------------------------------------------------------
// Abort support
// ---------------------------------------------------------------------------

let batchAbortController: AbortController | null = null;

const abortBatch = (): boolean => {
  if (!batchStartedAt) return false;
  batchAbortController?.abort();
  killAllActiveProcesses();
  batchStartedAt = null;
  batchAbortController = null;
  return true;
};

// ---------------------------------------------------------------------------
// Single-phase maestro record helper
// ---------------------------------------------------------------------------

type MaestroRecordResult = {
  exitCode: number;
  passed: boolean;
  stderr: string;
  videoProduced: boolean;
  durationMs: number;
};

const runMaestroRecord = (
  testFile: string,
  outputPath: string,
  timeoutMs: number,
): Promise<MaestroRecordResult> => {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const child = spawn("maestro", ["record", testFile, outputPath], {
      stdio: ["ignore", "ignore", "pipe"],
      timeout: timeoutMs,
    });

    activeProcesses.add(child);

    const stderrChunks: Buffer[] = [];
    child.stderr.on("data", (chunk: Buffer) => stderrChunks.push(chunk));

    child.on("close", (code) => {
      activeProcesses.delete(child);
      const exitCode = code ?? 1;
      const stderr = Buffer.concat(stderrChunks).toString();
      resolve({
        exitCode,
        passed: exitCode === 0,
        stderr,
        videoProduced: existsSync(outputPath),
        durationMs: Date.now() - startTime,
      });
    });

    child.on("error", () => {
      activeProcesses.delete(child);
      resolve({
        exitCode: 1,
        passed: false,
        stderr: "Failed to spawn maestro process",
        videoProduced: existsSync(outputPath),
        durationMs: Date.now() - startTime,
      });
    });
  });
};

// ---------------------------------------------------------------------------
// Core runner
// ---------------------------------------------------------------------------

const runBatchTests = async (
  db: Database.Database,
  recordingsDir: string,
  options: BatchOptions,
): Promise<BatchResult> => {
  if (isBatchRunning()) {
    throw new Error("A batch run is already in progress");
  }

  batchStartedAt = Date.now();
  batchAbortController = new AbortController();
  const { signal } = batchAbortController;
  const batchId = randomUUID();
  const startTime = Date.now();

  try {
    const allScenarios = getScenarios();

    // Filter scenarios based on mode
    let scenarios: ScenarioConfig[];
    if (options.mode === "failed-only") {
      const latestRuns = listLatestTestRuns(db) as TestRunMeta[];
      const failedIds = new Set(
        latestRuns
          .filter((r: TestRunMeta) => r.status === "failed")
          .map((r: TestRunMeta) => r.scenarioId),
      );
      scenarios = allScenarios.filter((s) => failedIds.has(s.id));
    } else {
      scenarios = allScenarios;
    }

    // Only include scenarios that have a mapped test file
    scenarios = scenarios.filter((s) => s.testFile && SCENARIO_TEST_MAP[s.id]);

    const total = scenarios.length;
    let passed = 0;
    let failed = 0;
    let cached = 0;

    for (let i = 0; i < scenarios.length; i++) {
      // Check for abort before each scenario
      if (signal.aborted) {
        break;
      }

      const scenario = scenarios[i];
      const testRelPath = SCENARIO_TEST_MAP[scenario.id];
      if (!testRelPath) continue;

      const testFile = join(E2E_BASE, testRelPath);
      const progress = (i + 1) / total;

      // --- Phase 1: Hash check ---
      options.onProgress?.({
        type: "batch-progress",
        batchId,
        scenarioId: scenario.id,
        phase: "hash-check",
        status: "running",
        message: "Checking cache...",
        progress: i / total,
      });

      if (!existsSync(testFile)) {
        upsertTestRun(db, {
          scenarioId: scenario.id,
          flowFile: testRelPath,
          flowHash: "missing",
          status: "failed",
          errorMessage: `Test file not found: ${testRelPath}`,
          batchId,
        });
        failed++;
        options.onProgress?.({
          type: "batch-progress",
          batchId,
          scenarioId: scenario.id,
          phase: "done",
          status: "failed",
          message: "Test file not found",
          progress,
        });
        continue;
      }

      const flowHash = hashFlowFile(testFile);

      // Check cache
      const cachedRun = getTestRunByHash(db, scenario.id, flowHash);
      if (cachedRun && cachedRun.status === "passed") {
        cached++;
        options.onProgress?.({
          type: "batch-progress",
          batchId,
          scenarioId: scenario.id,
          phase: "done",
          status: "cached",
          message: `Cached (passed ${formatAgo(cachedRun.createdAt)})`,
          progress,
        });
        continue;
      }

      // --- Phase 2: Record (single-phase — produces exit code + video) ---
      options.onProgress?.({
        type: "batch-progress",
        batchId,
        scenarioId: scenario.id,
        phase: "recording",
        status: "running",
        message: "Recording...",
        progress: i / total,
      });

      // Mark as running
      upsertTestRun(db, {
        scenarioId: scenario.id,
        flowFile: testRelPath,
        flowHash,
        status: "running",
        batchId,
      });

      const safeName = scenario.id.replace(/[^a-zA-Z0-9-]/g, "-");
      const timestamp = Date.now();
      const filename = `${safeName}-${timestamp}.mp4`;
      const outputPath = join(recordingsDir, filename);

      const result = await runMaestroRecord(testFile, outputPath, 180_000);

      // Save recording if video was produced (regardless of pass/fail)
      if (result.videoProduced) {
        upsertRecording(db, {
          pathId: scenario.id,
          filename,
          durationMs: null,
          stepTimestamps: [],
        });
      }

      if (result.passed) {
        upsertTestRun(db, {
          scenarioId: scenario.id,
          flowFile: testRelPath,
          flowHash,
          status: "passed",
          durationMs: result.durationMs,
          batchId,
        });
        passed++;
        options.onProgress?.({
          type: "batch-progress",
          batchId,
          scenarioId: scenario.id,
          phase: "done",
          status: "passed",
          message: `Passed (${(result.durationMs / 1000).toFixed(1)}s)`,
          progress,
        });
      } else {
        const errorMessage = parseMaestroError(result.stderr);
        upsertTestRun(db, {
          scenarioId: scenario.id,
          flowFile: testRelPath,
          flowHash,
          status: "failed",
          durationMs: result.durationMs,
          errorMessage,
          batchId,
        });
        failed++;
        options.onProgress?.({
          type: "batch-progress",
          batchId,
          scenarioId: scenario.id,
          phase: "done",
          status: "failed",
          message: errorMessage,
          progress,
        });
      }
    }

    return {
      batchId,
      total,
      passed,
      failed,
      cached,
      durationMs: Date.now() - startTime,
    };
  } finally {
    batchStartedAt = null;
    batchAbortController = null;
  }
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const formatAgo = (isoString: string): string => {
  const ms = Date.now() - new Date(isoString).getTime();
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  return `${hours}h ago`;
};

export { runBatchTests, isBatchRunning, abortBatch, killAllActiveProcesses };
export type { BatchMode, BatchProgressEvent, BatchResult, BatchOptions };
