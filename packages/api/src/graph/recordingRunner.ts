/**
 * On-demand Maestro recording runner.
 *
 * Finds the Maestro test file linked to a graph path ID,
 * runs `maestro record` on the linked simulator, and saves
 * the recording file + metadata to the recording store.
 *
 * Includes pre-flight checks for Maestro CLI and simulator
 * availability, returning structured errors with user-friendly
 * hints when something is misconfigured.
 */
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { upsertRecording, type RecordingMeta, type StepTimestamp } from "flow-graph";
import type Database from "better-sqlite3";

const execFileAsync = promisify(execFile);

/** Maps scenario IDs to their Maestro test files (relative to e2e/flows/). */
const SCENARIO_TEST_MAP: Record<string, string> = {
  "meetup-confirmed": "meetups/meetup-confirmed.yaml",
  "meetup-completed": "meetups/meetup-completed.yaml",
  "meetup-cancelled-from-proposed": "meetups/meetup-cancelled-from-proposed.yaml",
  "meetup-cancelled-from-confirmed": "meetups/meetup-cancelled-from-confirmed.yaml",
};

const E2E_BASE = resolve(
  import.meta.dirname ?? __dirname,
  "../../../../apps/mobile/e2e/flows",
);

type RecordingErrorCode =
  | "MAESTRO_NOT_INSTALLED"
  | "NO_SIMULATOR_BOOTED"
  | "TEST_FILE_NOT_FOUND"
  | "TEST_FILE_NOT_MAPPED"
  | "MAESTRO_TEST_FAILED"
  | "RECORDING_NOT_CREATED"
  | "UNKNOWN";

class RecordingError extends Error {
  code: RecordingErrorCode;
  hint: string;

  constructor(message: string, code: RecordingErrorCode, hint: string) {
    super(message);
    this.name = "RecordingError";
    this.code = code;
    this.hint = hint;
  }
}

/** Check if Maestro CLI is available. */
const checkMaestroInstalled = async (): Promise<void> => {
  try {
    await execFileAsync("which", ["maestro"], { timeout: 5_000 });
  } catch {
    throw new RecordingError(
      "Maestro CLI not found",
      "MAESTRO_NOT_INSTALLED",
      'Install with: curl -Ls "https://get.maestro.mobile.dev" | bash',
    );
  }
};

/** Check if at least one iOS simulator is booted. */
const checkSimulatorBooted = async (): Promise<void> => {
  try {
    const { stdout } = await execFileAsync(
      "xcrun",
      ["simctl", "list", "devices", "booted", "--json"],
      { timeout: 10_000 },
    );
    const parsed = JSON.parse(stdout) as { devices: Record<string, unknown[]> };
    const hasBooted = Object.values(parsed.devices).some((d) => d.length > 0);
    if (!hasBooted) {
      throw new RecordingError(
        "No iOS simulator running",
        "NO_SIMULATOR_BOOTED",
        "Boot one from the simulator dropdown, or run: open -a Simulator",
      );
    }
  } catch (err) {
    if (err instanceof RecordingError) throw err;
    throw new RecordingError(
      "No iOS simulator running",
      "NO_SIMULATOR_BOOTED",
      "Boot one from the simulator dropdown, or run: open -a Simulator",
    );
  }
};

/** Extract the first meaningful line from a Maestro error. */
const parseMaestroError = (rawMessage: string): string => {
  const lines = rawMessage.split("\n").map((l) => l.trim()).filter(Boolean);
  const meaningful = lines.find(
    (l) =>
      !l.startsWith("Usage:") &&
      !l.startsWith("maestro ") &&
      !l.startsWith("-") &&
      !l.startsWith("Options:") &&
      l.length > 10,
  );
  const msg = meaningful ?? lines[0] ?? rawMessage;
  return msg.length > 120 ? msg.slice(0, 120) + "..." : msg;
};

/**
 * Triggers a Maestro recording for the given path ID.
 *
 * 1. Runs pre-flight checks (Maestro CLI, simulator)
 * 2. Resolves the Maestro test file for the path
 * 3. Runs `maestro record <test-file> <output-path>`
 * 4. Saves the recording metadata to the DB
 */
const triggerRecording = async (
  db: Database.Database,
  pathId: string,
  recordingsDir: string,
): Promise<RecordingMeta> => {
  // --- Pre-flight checks ---
  await checkMaestroInstalled();
  await checkSimulatorBooted();

  const testRelPath = SCENARIO_TEST_MAP[pathId];
  if (!testRelPath) {
    throw new RecordingError(
      `No test file configured for scenario "${pathId}"`,
      "TEST_FILE_NOT_MAPPED",
      `Add a mapping in recordingRunner.ts for "${pathId}"`,
    );
  }

  const testFile = join(E2E_BASE, testRelPath);
  if (!existsSync(testFile)) {
    const filename = testRelPath.split("/").pop() ?? testRelPath;
    throw new RecordingError(
      `Test file missing: ${filename}`,
      "TEST_FILE_NOT_FOUND",
      `Create the test file at e2e/flows/${testRelPath}`,
    );
  }

  // Generate output filename
  const safeName = pathId.replace(/[^a-zA-Z0-9-]/g, "-");
  const timestamp = Date.now();
  const filename = `${safeName}-${timestamp}.mp4`;
  const outputPath = join(recordingsDir, filename);

  try {
    await execFileAsync(
      "maestro",
      ["record", testFile, outputPath],
      { timeout: 120_000 },
    );
  } catch (err) {
    const raw = (err as Error).message;
    throw new RecordingError(
      `Test failed: ${parseMaestroError(raw)}`,
      "MAESTRO_TEST_FAILED",
      "Check Maestro output for details",
    );
  }

  if (!existsSync(outputPath)) {
    throw new RecordingError(
      "Maestro ran but didn't produce a video",
      "RECORDING_NOT_CREATED",
      "Ensure the test flow completes successfully",
    );
  }

  // Placeholder step timestamps — in a full implementation these
  // would be extracted from live events emitted during the test run
  const stepTimestamps: StepTimestamp[] = [];

  const recording = upsertRecording(db, {
    pathId,
    filename,
    durationMs: null,
    stepTimestamps,
  });

  return recording;
};

/** Check Maestro setup readiness (used by /api/maestro/health). */
const checkMaestroHealth = async (): Promise<{
  maestroInstalled: boolean;
  maestroVersion: string | null;
  simulatorBooted: boolean;
  simulatorName: string | null;
}> => {
  let maestroInstalled = false;
  let maestroVersion: string | null = null;
  let simulatorBooted = false;
  let simulatorName: string | null = null;

  try {
    const { stdout } = await execFileAsync("maestro", ["--version"], { timeout: 5_000 });
    maestroInstalled = true;
    maestroVersion = stdout.trim();
  } catch {
    // not installed
  }

  try {
    const { stdout } = await execFileAsync(
      "xcrun",
      ["simctl", "list", "devices", "booted", "--json"],
      { timeout: 10_000 },
    );
    const parsed = JSON.parse(stdout) as { devices: Record<string, Array<{ name: string }>> };
    for (const devices of Object.values(parsed.devices)) {
      if (devices.length > 0) {
        simulatorBooted = true;
        simulatorName = devices[0].name;
        break;
      }
    }
  } catch {
    // can't check
  }

  return { maestroInstalled, maestroVersion, simulatorBooted, simulatorName };
};

export { triggerRecording, checkMaestroHealth, RecordingError, SCENARIO_TEST_MAP };
export type { RecordingErrorCode };
