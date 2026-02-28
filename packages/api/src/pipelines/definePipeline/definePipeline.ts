import { z } from 'zod';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@tcg-trade-hub/database';

type PipelineContext = {
  supabase: SupabaseClient<Database>;
  userId: string;
  adminSupabase?: SupabaseClient<Database>;
};

/**
 * A pre-check runs before the RPC call. Throws on failure to abort the pipeline.
 * Can be async for DB lookups (e.g., ownership verification).
 */
type PreCheck<TInput> = {
  name: string;
  run: (input: TInput, context: PipelineContext) => void | Promise<void>;
};

type RpcSpec<TInput, TRpcResult> = {
  /** Postgres function name (e.g., 'accept_offer_v1') */
  functionName: string;
  /** Maps validated pipeline input to the RPC function parameters */
  mapParams: (input: TInput, context: PipelineContext) => Record<string, unknown>;
  /** Zod schema for the RPC result */
  resultSchema: z.ZodType<TRpcResult>;
};

/**
 * A post-commit effect runs after the RPC succeeds.
 * Failures are logged but do not roll back the transaction.
 */
type PostEffect<TInput, TRpcResult> = {
  name: string;
  run: (input: TInput, result: TRpcResult, context: PipelineContext) => Promise<void>;
};

type PipelineConfig<TInput, TRpcResult> = {
  name: string;
  description: string;
  inputSchema: z.ZodType<TInput>;
  preChecks: PreCheck<TInput>[];
  rpc: RpcSpec<TInput, TRpcResult>;
  postEffects: PostEffect<TInput, TRpcResult>[];
};

type Pipeline<TInput, TRpcResult> = PipelineConfig<TInput, TRpcResult> & {
  /**
   * Executes the full pipeline: validate → pre-checks → RPC → validate result → post-effects.
   */
  execute: (rawInput: unknown, context: PipelineContext) => Promise<TRpcResult>;
};

/**
 * Creates a typed, executable pipeline definition.
 *
 * Each pipeline is the single source of truth for a state-changing workflow:
 * what it validates, what DB operations it performs (via a single RPC call),
 * and what side effects it triggers afterward.
 */
const definePipeline = <TInput, TRpcResult>(
  config: PipelineConfig<TInput, TRpcResult>,
): Pipeline<TInput, TRpcResult> => {
  const execute = async (
    rawInput: unknown,
    context: PipelineContext,
  ): Promise<TRpcResult> => {
    // 1. Validate input
    const input = config.inputSchema.parse(rawInput);

    // 2. Run pre-checks sequentially (any failure throws, aborting the pipeline)
    for (const check of config.preChecks) {
      await check.run(input, context);
    }

    // 3. Execute the atomic RPC call
    const params = config.rpc.mapParams(input, context);
    const { data, error } = await context.supabase.rpc(
      config.rpc.functionName as never,
      params as never,
    );

    if (error) {
      throw new Error(`Pipeline "${config.name}" RPC failed: ${error.message}`);
    }

    // 4. Validate RPC result
    const result = config.rpc.resultSchema.parse(data);

    // 5. Fire post-commit effects (non-critical, logged on failure)
    for (const effect of config.postEffects) {
      try {
        await effect.run(input, result, context);
      } catch (err) {
        console.error(
          `Pipeline "${config.name}" post-effect "${effect.name}" failed:`,
          err,
        );
      }
    }

    return result;
  };

  return { ...config, execute };
};

export default definePipeline;
export type {
  Pipeline,
  PipelineConfig,
  PipelineContext,
  PreCheck,
  RpcSpec,
  PostEffect,
};
