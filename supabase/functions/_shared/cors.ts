/**
 * Standard CORS headers for Supabase Edge Functions.
 * Import and spread into every Response, and handle OPTIONS preflight.
 */

export const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

/**
 * Returns a 204 No Content response for CORS preflight requests.
 * Usage: `if (req.method === 'OPTIONS') return handleCors();`
 */
export function handleCors(): Response {
  return new Response('ok', { status: 200, headers: corsHeaders });
}

/**
 * Creates a JSON response with CORS headers attached.
 */
export function jsonResponse(
  body: unknown,
  status = 200,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

/**
 * Creates a JSON error response with CORS headers attached.
 */
export function errorResponse(
  message: string,
  status = 400,
): Response {
  return jsonResponse({ error: message }, status);
}
