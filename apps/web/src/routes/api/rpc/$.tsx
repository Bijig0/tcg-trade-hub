import { createFileRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';

const rpcHandler = createServerFn().handler(async ({ request }) => {
  const { handleRPC } = await import('../../../lib/rpcHandler.server');
  return handleRPC(request!);
});

export const Route = createFileRoute('/api/rpc/$')({
  server: {
    handlers: {
      ANY: async ({ request }) => {
        const { handleRPC } = await import('../../../lib/rpcHandler.server');
        return handleRPC(request);
      },
    },
  },
});
