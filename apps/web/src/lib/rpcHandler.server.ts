import { RPCHandler } from '@orpc/server/fetch';
import { onError } from '@orpc/server';
import { router } from '@tcg-trade-hub/api';
import { createSupabaseServiceClient } from './supabase.server';

const handler = new RPCHandler(router, {
  strictGetMethodPluginEnabled: false,
  interceptors: [
    onError((error) => {
      console.error('[oRPC Error]', error);
    }),
  ],
});

export const handleRPC = async (request: Request): Promise<Response> => {
  const supabase = createSupabaseServiceClient();
  const { response } = await handler.handle(request, {
    prefix: '/api/rpc',
    context: { supabase },
  });

  return response ?? new Response('Not Found', { status: 404 });
};
