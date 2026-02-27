/**
 * oRPC client for the graph server (dev-only).
 * Used by DevAdminLink to check graph server connectivity.
 *
 * Type is `any` because we can't import @tcg-trade-hub/api in the mobile
 * bundle (it depends on flow-graph which has native deps that break Metro).
 * The result shape is asserted at the call site.
 */
import { createORPCClient } from '@orpc/client';
import { RPCLink } from '@orpc/client/fetch';

export type GraphStatus = { online: boolean; paths: number; clients: number };

const GRAPH_SERVER_URL =
  process.env.EXPO_PUBLIC_GRAPH_SERVER_URL ?? 'http://localhost:4243';

const link = new RPCLink({
  url: `${GRAPH_SERVER_URL}/api/rpc`,
  fetch: (input, init) => {
    const url =
      typeof input === 'string'
        ? input
        : input instanceof Request
          ? input.url
          : String(input);
    console.log('[graphClient] fetch →', url);
    return fetch(input, {
      ...init,
      signal: AbortSignal.timeout(5_000),
    })
      .then((res) => {
        console.log('[graphClient] fetch ←', res.status, res.statusText);
        return res;
      })
      .catch((err) => {
        console.error('[graphClient] fetch FAILED:', err?.message ?? err);
        throw err;
      });
  },
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const graphClient = createORPCClient<any>(link);
