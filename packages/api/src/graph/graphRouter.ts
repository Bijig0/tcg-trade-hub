/**
 * oRPC router for the graph server.
 * Exposes graph status + health info so clients get type-safe access.
 */
import { os as baseOs } from '@orpc/server';
import { z } from 'zod';

export type GraphContext = {
  getWsClientCount: () => number;
  getPathCount: () => number;
};

const os = baseOs.$context<GraphContext>();

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

export const graphRouter = { status };
export type GraphRouter = typeof graphRouter;
