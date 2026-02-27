import { RPCHandler } from '@orpc/server/fetch';
import { onError } from '@orpc/server';
import { router } from '@tcg-trade-hub/api';
import { UserRolesArraySchema } from '@tcg-trade-hub/database';
import { createSupabaseServerClient, createSupabaseServiceClient } from './supabase.server';

const handler = new RPCHandler(router, {
  interceptors: [
    onError((error) => {
      console.error('[oRPC Error]', error);
    }),
  ],
});

export const handleRPC = async (request: Request): Promise<Response> => {
  const supabase = createSupabaseServerClient(request);

  // Extract userId and roles from session
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;

  const parsed = UserRolesArraySchema.safeParse(user?.app_metadata?.roles);
  const roles = parsed.success ? parsed.data : [];

  const adminSupabase = createSupabaseServiceClient();

  const { response } = await handler.handle(request, {
    prefix: '/api/rpc',
    context: { supabase, userId, roles, adminSupabase },
  });

  return response ?? new Response('Not Found', { status: 404 });
};
