import { createFileRoute } from '@tanstack/react-router';

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
