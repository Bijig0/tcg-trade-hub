import { describe, it, expect, vi } from 'vitest';
import { z } from 'zod';
import definePipeline from './definePipeline';
import type { PipelineContext } from './definePipeline';

const makeMockContext = (rpcResult: unknown = {}, rpcError: null | { message: string } = null): PipelineContext => ({
  supabase: {
    rpc: vi.fn().mockResolvedValue({ data: rpcResult, error: rpcError }),
  } as unknown as PipelineContext['supabase'],
  userId: 'user-123',
});

describe('definePipeline', () => {
  const testSchema = z.object({ id: z.string().uuid() });
  const resultSchema = z.object({ success: z.boolean() });

  it('validates input with the provided schema', async () => {
    const pipeline = definePipeline({
      name: 'test',
      description: 'test pipeline',
      inputSchema: testSchema,
      preChecks: [],
      rpc: {
        functionName: 'test_fn',
        mapParams: (input) => ({ p_id: input.id }),
        resultSchema,
      },
      postEffects: [],
    });

    const ctx = makeMockContext({ success: true });
    await expect(pipeline.execute({ id: 'not-a-uuid' }, ctx)).rejects.toThrow();
  });

  it('runs pre-checks in order and aborts on failure', async () => {
    const order: string[] = [];
    const pipeline = definePipeline({
      name: 'test',
      description: 'test pipeline',
      inputSchema: testSchema,
      preChecks: [
        { name: 'first', run: () => { order.push('first'); } },
        { name: 'failing', run: () => { throw new Error('check failed'); } },
        { name: 'never', run: () => { order.push('never'); } },
      ],
      rpc: {
        functionName: 'test_fn',
        mapParams: (input) => ({ p_id: input.id }),
        resultSchema,
      },
      postEffects: [],
    });

    const ctx = makeMockContext({ success: true });
    const validId = '550e8400-e29b-41d4-a716-446655440000';
    await expect(pipeline.execute({ id: validId }, ctx)).rejects.toThrow('check failed');
    expect(order).toEqual(['first']);
  });

  it('calls supabase.rpc with mapped params', async () => {
    const pipeline = definePipeline({
      name: 'test',
      description: 'test pipeline',
      inputSchema: testSchema,
      preChecks: [],
      rpc: {
        functionName: 'my_rpc_fn',
        mapParams: (input, ctx) => ({ p_id: input.id, p_user: ctx.userId }),
        resultSchema,
      },
      postEffects: [],
    });

    const ctx = makeMockContext({ success: true });
    const validId = '550e8400-e29b-41d4-a716-446655440000';
    await pipeline.execute({ id: validId }, ctx);

    expect(ctx.supabase.rpc).toHaveBeenCalledWith('my_rpc_fn', {
      p_id: validId,
      p_user: 'user-123',
    });
  });

  it('throws when RPC returns an error', async () => {
    const pipeline = definePipeline({
      name: 'test',
      description: 'test pipeline',
      inputSchema: testSchema,
      preChecks: [],
      rpc: {
        functionName: 'test_fn',
        mapParams: (input) => ({ p_id: input.id }),
        resultSchema,
      },
      postEffects: [],
    });

    const ctx = makeMockContext(null, { message: 'db error' });
    const validId = '550e8400-e29b-41d4-a716-446655440000';
    await expect(pipeline.execute({ id: validId }, ctx)).rejects.toThrow('RPC failed: db error');
  });

  it('validates the RPC result against resultSchema', async () => {
    const pipeline = definePipeline({
      name: 'test',
      description: 'test pipeline',
      inputSchema: testSchema,
      preChecks: [],
      rpc: {
        functionName: 'test_fn',
        mapParams: (input) => ({ p_id: input.id }),
        resultSchema,
      },
      postEffects: [],
    });

    const ctx = makeMockContext({ wrong_shape: 123 });
    const validId = '550e8400-e29b-41d4-a716-446655440000';
    await expect(pipeline.execute({ id: validId }, ctx)).rejects.toThrow();
  });

  it('runs post-effects after successful RPC and does not throw on effect failure', async () => {
    const effectRan = vi.fn();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    const pipeline = definePipeline({
      name: 'test',
      description: 'test pipeline',
      inputSchema: testSchema,
      preChecks: [],
      rpc: {
        functionName: 'test_fn',
        mapParams: (input) => ({ p_id: input.id }),
        resultSchema,
      },
      postEffects: [
        { name: 'good', run: async () => { effectRan(); } },
        { name: 'bad', run: async () => { throw new Error('effect failed'); } },
      ],
    });

    const ctx = makeMockContext({ success: true });
    const validId = '550e8400-e29b-41d4-a716-446655440000';
    const result = await pipeline.execute({ id: validId }, ctx);

    expect(result).toEqual({ success: true });
    expect(effectRan).toHaveBeenCalled();
    expect(consoleError).toHaveBeenCalledWith(
      expect.stringContaining('post-effect "bad" failed'),
      expect.any(Error),
    );

    consoleError.mockRestore();
  });

  it('exposes config properties on the pipeline object', () => {
    const pipeline = definePipeline({
      name: 'myPipeline',
      description: 'does things',
      inputSchema: testSchema,
      preChecks: [{ name: 'check1', run: () => {} }],
      rpc: {
        functionName: 'my_fn',
        mapParams: (input) => ({ p_id: input.id }),
        resultSchema,
      },
      postEffects: [],
    });

    expect(pipeline.name).toBe('myPipeline');
    expect(pipeline.description).toBe('does things');
    expect(pipeline.rpc.functionName).toBe('my_fn');
    expect(pipeline.preChecks).toHaveLength(1);
  });
});
