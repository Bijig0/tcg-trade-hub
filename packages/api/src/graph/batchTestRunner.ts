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

type BatchLogEvent = {
  type: "batch-log";
  batchId: string;
  scenarioId: string | null;
  level: "info" | "error" | "stderr";
  message: string;
  timestamp: number;
};

type BatchOptions = {
  mode: BatchMode;
  onProgress?: (event: BatchProgressEvent) => void;
  onLog?: (event: BatchLogEvent) => void;
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
  onStderr?: (line: string) => void,
  onStdout?: (line: string) => void,
): Promise<MaestroRecordResult> => {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const child = spawn("maestro", ["record", testFile, outputPath], {
      stdio: ["ignore", "pipe", "pipe"],
      timeout: timeoutMs,
    });

    activeProcesses.add(child);

    const stderrChunks: Buffer[] = [];
    let stderrBuffer = "";
    child.stderr.on("data", (chunk: Buffer) => {
      stderrChunks.push(chunk);
      stderrBuffer += chunk.toString();
      const lines = stderrBuffer.split("\n");
      stderrBuffer = lines.pop() ?? "";
      for (const line of lines) {
        if (line.trim()) onStderr?.(line);
      }
    });

    let stdoutBuffer = "";
    child.stdout.on("data", (chunk: Buffer) => {
      stdoutBuffer += chunk.toString();
      const lines = stdoutBuffer.split("\n");
      stdoutBuffer = lines.pop() ?? "";
      for (const line of lines) {
        if (line.trim()) onStdout?.(line);
      }
    });

    child.on("close", (code) => {
      activeProcesses.delete(child);
      // Flush remaining partial lines
      if (stderrBuffer.trim()) onStderr?.(stderrBuffer);
      if (stdoutBuffer.trim()) onStdout?.(stdoutBuffer);
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

  const emitLog = (
    scenarioId: string | null,
    level: BatchLogEvent["level"],
    message: string,
  ) => {
    const logLine = scenarioId
      ? `[Batch] ${scenarioId}: ${message}`
      : `[Batch] ${message}`;
    if (level === "error") {
      console.error(logLine);
    } else {
      console.log(logLine);
    }
    options.onLog?.({
      type: "batch-log",
      batchId,
      scenarioId,
      level,
      message,
      timestamp: Date.now(),
    });
  };

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

    emitLog(null, "info", `Starting batch run (id: ${batchId.slice(0, 8)}, mode: ${options.mode}, scenarios: ${total})`);

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
      emitLog(scenario.id, "info", "Checking cache...");
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
        emitLog(scenario.id, "error", `Test file not found: ${testRelPath}`);
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
        const ago = formatAgo(cachedRun.createdAt);
        emitLog(scenario.id, "info", `Cache hit (passed ${ago}), skipping`);
        cached++;
        options.onProgress?.({
          type: "batch-progress",
          batchId,
          scenarioId: scenario.id,
          phase: "done",
          status: "cached",
          message: `Cached (passed ${ago})`,
          progress,
        });
        continue;
      }

      // --- Phase 2: Record (single-phase — produces exit code + video) ---
      emitLog(scenario.id, "info", `Recording — maestro record ${testRelPath}`);
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

      const result = await runMaestroRecord(
        testFile,
        outputPath,
        180_000,
        (line) => emitLog(scenario.id, "stderr", line),
        (line) => emitLog(scenario.id, "info", line),
      );

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
        const durationStr = (result.durationMs / 1000).toFixed(1);
        emitLog(scenario.id, "info", `Passed (${durationStr}s)`);
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
          message: `Passed (${durationStr}s)`,
          progress,
        });
      } else {
        const errorMessage = parseMaestroError(result.stderr);
        emitLog(scenario.id, "error", `Failed — ${errorMessage}`);
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

    const totalDuration = ((Date.now() - startTime) / 1000).toFixed(1);
    emitLog(null, "info", `Complete: ${passed} passed, ${failed} failed, ${cached} cached (${totalDuration}s)`);

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
export type { BatchMode, BatchProgressEvent, BatchLogEvent, BatchResult, BatchOptions };
