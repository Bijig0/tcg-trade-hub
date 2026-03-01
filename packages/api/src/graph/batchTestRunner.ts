/**
 * Batch Maestro test runner with content-based caching.
 *
 * Two-phase execution per scenario:
 *   1. Fast `maestro test <flow.yaml>` — exit 0 = pass, 1 = fail
 *   2. `maestro record <flow.yaml> <output.mp4>` — only if phase 1 passed
 *
 * Results are cached in SQLite keyed on SHA-256 of flow file contents.
 * Subsequent runs skip scenarios whose flow files haven't changed.
 */
import { execFile } from "node:child_process";
import { promisify } from "node:util";
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
import { SCENARIO_TEST_MAP } from "./recordingRunner";
import { getScenarios, type ScenarioConfig } from "./scenarios";

const execFileAsync = promisify(execFile);

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
  phase: "hash-check" | "testing" | "recording" | "done";
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
// Concurrency guard
// ---------------------------------------------------------------------------

let batchRunning = false;

const isBatchRunning = (): boolean => batchRunning;

// ---------------------------------------------------------------------------
// Core runner
// ---------------------------------------------------------------------------

const runBatchTests = async (
  db: Database.Database,
  recordingsDir: string,
  options: BatchOptions,
): Promise<BatchResult> => {
  if (batchRunning) {
    throw new Error("A batch run is already in progress");
  }

  batchRunning = true;
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

      // --- Phase 2: Run maestro test ---
      options.onProgress?.({
        type: "batch-progress",
        batchId,
        scenarioId: scenario.id,
        phase: "testing",
        status: "running",
        message: "Running test...",
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

      const testStartTime = Date.now();
      let testPassed = false;
      let testError: string | null = null;

      try {
        await execFileAsync("maestro", ["test", testFile], {
          timeout: 180_000,
        });
        testPassed = true;
      } catch (err) {
        const raw = (err as Error).message;
        const lines = raw.split("\n").filter(Boolean);
        testError =
          lines.find(
            (l) =>
              !l.startsWith("Usage:") &&
              !l.startsWith("maestro ") &&
              !l.startsWith("-") &&
              l.length > 10,
          ) ??
          lines[0] ??
          raw;
        if (testError.length > 200) testError = testError.slice(0, 200) + "...";
      }

      const testDurationMs = Date.now() - testStartTime;

      if (!testPassed) {
        upsertTestRun(db, {
          scenarioId: scenario.id,
          flowFile: testRelPath,
          flowHash,
          status: "failed",
          durationMs: testDurationMs,
          errorMessage: testError,
          batchId,
        });
        failed++;
        options.onProgress?.({
          type: "batch-progress",
          batchId,
          scenarioId: scenario.id,
          phase: "done",
          status: "failed",
          message: testError ?? "Test failed",
          progress,
        });
        continue;
      }

      // --- Phase 3: Record (best-effort) ---
      options.onProgress?.({
        type: "batch-progress",
        batchId,
        scenarioId: scenario.id,
        phase: "recording",
        status: "running",
        message: "Recording video...",
        progress: i / total,
      });

      const safeName = scenario.id.replace(/[^a-zA-Z0-9-]/g, "-");
      const timestamp = Date.now();
      const filename = `${safeName}-${timestamp}.mp4`;
      const outputPath = join(recordingsDir, filename);

      try {
        await execFileAsync("maestro", ["record", testFile, outputPath], {
          timeout: 180_000,
        });

        if (existsSync(outputPath)) {
          upsertRecording(db, {
            pathId: scenario.id,
            filename,
            durationMs: null,
            stepTimestamps: [],
          });
        }
      } catch {
        // Recording is best-effort — test still passed
      }

      // Mark test as passed regardless of recording outcome
      upsertTestRun(db, {
        scenarioId: scenario.id,
        flowFile: testRelPath,
        flowHash,
        status: "passed",
        durationMs: testDurationMs,
        batchId,
      });
      passed++;

      options.onProgress?.({
        type: "batch-progress",
        batchId,
        scenarioId: scenario.id,
        phase: "done",
        status: "passed",
        message: `Passed (${(testDurationMs / 1000).toFixed(1)}s)`,
        progress,
      });
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
    batchRunning = false;
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

export { runBatchTests, isBatchRunning };
export type { BatchMode, BatchProgressEvent, BatchResult, BatchOptions };
