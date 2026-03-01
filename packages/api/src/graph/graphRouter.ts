/**
 * oRPC router for the graph server.
 *
 * All Maestro-related operations go through this router so both
 * server and client get full Zod validation at the network boundary.
 */
import { os as baseOs } from '@orpc/server';
import { z } from 'zod';

// ---------------------------------------------------------------------------
// Zod schemas (shared between server output validation and client type inference)
// ---------------------------------------------------------------------------

const RecordingErrorCodeSchema = z.enum([
  'MAESTRO_NOT_INSTALLED',
  'NO_SIMULATOR_BOOTED',
  'TEST_FILE_NOT_FOUND',
  'TEST_FILE_NOT_MAPPED',
  'MAESTRO_TEST_FAILED',
  'RECORDING_NOT_CREATED',
  'UNKNOWN',
]);

const StepTimestampSchema = z.object({
  stepIndex: z.number().int(),
  timestampMs: z.number(),
});

const RecordingMetaSchema = z.object({
  id: z.number().int(),
  pathId: z.string(),
  filename: z.string(),
  durationMs: z.number().nullable(),
  stepTimestamps: z.array(StepTimestampSchema),
  createdAt: z.string(),
});

const MaestroHealthSchema = z.object({
  maestroInstalled: z.boolean(),
  maestroVersion: z.string().nullable(),
  simulatorBooted: z.boolean(),
  simulatorName: z.string().nullable(),
});

const RecordingErrorSchema = z.object({
  error: z.string(),
  code: RecordingErrorCodeSchema,
  hint: z.string(),
});

const RecordingResultSchema = z.discriminatedUnion('ok', [
  z.object({ ok: z.literal(true), recording: RecordingMetaSchema }),
  z.object({ ok: z.literal(false) }).merge(RecordingErrorSchema),
]);

/**
 * Allowlist of valid scenario path IDs.
 *
 * Only IDs matching this pattern are accepted — prevents arbitrary
 * strings from reaching CLI commands or file system operations.
 */
const SCENARIO_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const ScenarioIdSchema = z
  .string()
  .min(1)
  .max(100)
  .regex(SCENARIO_ID_PATTERN, 'Invalid scenario ID format (lowercase alphanumeric + hyphens only)');

const TestRunMetaSchema = z.object({
  id: z.number().int(),
  scenarioId: z.string(),
  flowFile: z.string(),
  flowHash: z.string(),
  status: z.enum(['passed', 'failed', 'running']),
  durationMs: z.number().nullable(),
  errorMessage: z.string().nullable(),
  batchId: z.string().nullable(),
  createdAt: z.string(),
});

const BatchModeSchema = z.enum(['all', 'failed-only']);

const BatchResultSchema = z.object({
  batchId: z.string(),
  total: z.number().int(),
  passed: z.number().int(),
  failed: z.number().int(),
  cached: z.number().int(),
  durationMs: z.number(),
});

// ---------------------------------------------------------------------------
// Context — extended by serve.ts with actual implementations
// ---------------------------------------------------------------------------

type MaestroHealthResult = z.infer<typeof MaestroHealthSchema>;
type RecordingResult = z.infer<typeof RecordingResultSchema>;
type BatchResultType = z.infer<typeof BatchResultSchema>;

export type GraphContext = {
  getWsClientCount: () => number;
  getPathCount: () => number;
  getMaestroHealth: () => Promise<MaestroHealthResult>;
  triggerMaestroRecording: (pathId: string) => Promise<RecordingResult>;
  getLatestTestRuns: () => z.infer<typeof TestRunMetaSchema>[];
  triggerBatchTest: (mode: z.infer<typeof BatchModeSchema>) => Promise<BatchResultType>;
  isBatchRunning: () => boolean;
};

const os = baseOs.$context<GraphContext>();

// ---------------------------------------------------------------------------
// Procedures
// ---------------------------------------------------------------------------

const status = os
  .output(
    z.object({
      online: z.boolean(),
      paths: z.number(),
      clients: z.number(),
    }),
  )
  .handler(async ({ context }) => ({
    online: true,
    paths: context.getPathCount(),
    clients: context.getWsClientCount(),
  }));

const maestroHealth = os
  .output(MaestroHealthSchema)
  .handler(async ({ context }) => {
    return context.getMaestroHealth();
  });

const maestroRecord = os
  .input(z.object({ pathId: ScenarioIdSchema }))
  .output(RecordingResultSchema)
  .handler(async ({ input, context }) => {
    return context.triggerMaestroRecording(input.pathId);
  });

const maestroTestRuns = os
  .output(z.array(TestRunMetaSchema))
  .handler(async ({ context }) => {
    return context.getLatestTestRuns();
  });

const BatchRunOutputSchema = z.discriminatedUnion('ok', [
  z.object({ ok: z.literal(true) }).merge(BatchResultSchema),
  z.object({ ok: z.literal(false), error: z.string() }),
]);

const maestroBatchRun = os
  .input(z.object({ mode: BatchModeSchema }))
  .output(BatchRunOutputSchema)
  .handler(async ({ input, context }) => {
    if (context.isBatchRunning()) {
      return { ok: false as const, error: "A batch run is already in progress" };
    }
    const result = await context.triggerBatchTest(input.mode);
    return { ok: true as const, ...result };
  });

const maestroBatchStatus = os
  .output(z.object({ running: z.boolean() }))
  .handler(async ({ context }) => {
    return { running: context.isBatchRunning() };
  });

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

export const graphRouter = {
  status,
  maestro: {
    health: maestroHealth,
    record: maestroRecord,
    testRuns: maestroTestRuns,
    batchRun: maestroBatchRun,
    batchStatus: maestroBatchStatus,
  },
};

export type GraphRouter = typeof graphRouter;

// Re-export schemas for client-side validation
export {
  MaestroHealthSchema,
  RecordingResultSchema,
  RecordingErrorCodeSchema,
  ScenarioIdSchema,
  TestRunMetaSchema,
  BatchResultSchema,
  BatchModeSchema,
};
