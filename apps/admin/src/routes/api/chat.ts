import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/api/chat')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { handleChatRequest } = await import(
          '../../lib/graphChat.server'
        );
        return handleChatRequest(request);
      },
    },
  },
});
