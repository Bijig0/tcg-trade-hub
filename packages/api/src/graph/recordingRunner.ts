/**
 * On-demand Maestro recording runner.
 *
 * Finds the Maestro test file linked to a graph path ID,
 * runs `maestro record` on the linked simulator, and saves
 * the recording file + metadata to the recording store.
 */
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { upsertRecording, type RecordingMeta, type StepTimestamp } from "flow-graph";
import type Database from "better-sqlite3";

const execFileAsync = promisify(execFile);

/** Maps scenario path IDs to their Maestro test files (relative to e2e/flows/). */
const SCENARIO_TEST_MAP: Record<string, string> = {
  "scenario:meetup-confirmed": "meetups/meetup-confirmed.yaml",
  "scenario:meetup-completed": "meetups/meetup-completed.yaml",
  "scenario:meetup-cancelled-from-proposed": "meetups/meetup-cancelled-from-proposed.yaml",
  "scenario:meetup-cancelled-from-confirmed": "meetups/meetup-cancelled-from-confirmed.yaml",
};

const E2E_BASE = resolve(
  import.meta.dirname ?? __dirname,
  "../../../../apps/mobile/e2e/flows",
);

/**
 * Triggers a Maestro recording for the given path ID.
 *
 * 1. Resolves the Maestro test file for the path
 * 2. Runs `maestro record <test-file> --output <output-path>`
 * 3. Saves the recording metadata to the DB
 */
const triggerRecording = async (
  db: Database.Database,
  pathId: string,
  recordingsDir: string,
): Promise<RecordingMeta> => {
  const testRelPath = SCENARIO_TEST_MAP[pathId];
  if (!testRelPath) {
    throw new Error(
      `No Maestro test file mapped for path "${pathId}". ` +
      `Available: ${Object.keys(SCENARIO_TEST_MAP).join(", ")}`,
    );
  }

  const testFile = join(E2E_BASE, testRelPath);
  if (!existsSync(testFile)) {
    throw new Error(`Maestro test file not found: ${testFile}`);
  }

  // Generate output filename
  const safeName = pathId.replace(/[^a-zA-Z0-9-]/g, "-");
  const timestamp = Date.now();
  const filename = `${safeName}-${timestamp}.mp4`;
  const outputPath = join(recordingsDir, filename);

  try {
    await execFileAsync(
      "maestro",
      ["record", testFile, "--output", outputPath],
      { timeout: 120_000 },
    );
  } catch (err) {
    const message = (err as Error).message;
    throw new Error(`Maestro recording failed: ${message}`);
  }

  if (!existsSync(outputPath)) {
    throw new Error("Recording file was not created by Maestro");
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

export { triggerRecording, SCENARIO_TEST_MAP };
