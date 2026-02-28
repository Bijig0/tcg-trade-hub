/**
 * Type-safe oRPC client for the graph server.
 *
 * All Maestro operations (health check, recording trigger) go through
 * this client so inputs/outputs are validated by Zod at the boundary.
 */
import type { GraphRouter } from '@tcg-trade-hub/api';
import type { RouterClient } from '@orpc/server';
import { createORPCClient } from '@orpc/client';
import { RPCLink } from '@orpc/client/fetch';
import { createTanstackQueryUtils } from '@orpc/tanstack-query';

const GRAPH_SERVER_URL = 'http://localhost:4243';

const link = new RPCLink({
  url: `${GRAPH_SERVER_URL}/api/rpc`,
});

export const graphClient: RouterClient<GraphRouter> = createORPCClient(link);

export const graphOrpc = createTanstackQueryUtils(graphClient);
