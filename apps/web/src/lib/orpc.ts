import type { Router } from '@tcg-trade-hub/api';
import type { RouterClient } from '@orpc/server';
import { createORPCClient } from '@orpc/client';
import { RPCLink } from '@orpc/client/fetch';
import { createTanstackQueryUtils } from '@orpc/tanstack-query';

const link = new RPCLink({
  url: typeof window !== 'undefined'
    ? `${window.location.origin}/api/rpc`
    : 'http://localhost:3000/api/rpc',
});

export const client: RouterClient<Router> = createORPCClient(link);

export const orpc = createTanstackQueryUtils(client);
