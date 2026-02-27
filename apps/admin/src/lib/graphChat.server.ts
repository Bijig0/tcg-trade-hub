import { anthropic } from '@ai-sdk/anthropic';
import { streamText, tool, stepCountIs } from 'ai';
import { z } from 'zod';
import { chatRequestSchema } from '@/features/chat/schemas';
import { checkRateLimit } from '@/lib/rateLimit/rateLimit';

const GRAPH_SERVER_URL = process.env.GRAPH_SERVER_URL || 'http://localhost:4243';

const SYSTEM_PROMPT = `You are a graph analysis assistant for TCG Trade Hub, a location-based trading card game app.
You help administrators understand the application's service graph — the procedures, database tables, storage buckets, external services, and the behavioral paths that connect them.

When the user asks about the graph, ALWAYS call the queryGraphData tool first to get current data before answering. Never guess or rely on prior assumptions about what's in the graph.

Key concepts:
- **Registry entries**: Individual operations/procedures in the system (oRPC procedures, Supabase Edge Functions, external integrations). Each has a unique ID, a type (procedure, table, storage, ext), and metadata.
- **Paths**: Named behavioral flows that trace a user journey through multiple steps (e.g., "create-listing" traces from user action → procedure → database writes → notifications). Each path has an ID, name, description, and an ordered list of steps connecting registry entries.
- **Annotations**: Metadata attached to graph nodes or edges — display labels, notes, colors, or groupings that enrich the visualization.
- **Graph nodes**: Entities of type \`app\`, \`procedure\`, \`table\`, \`storage\`, or \`ext\` (external service). Each node represents a system component.
- **Graph edges**: Directed connections between nodes, optionally labeled with a database operation (\`select\`, \`insert\`, \`update\`, \`delete\`, \`upsert\`, \`rpc\`) or a custom label.

When describing paths, explain each step in order and what procedures/tables are involved.
When describing nodes, explain their type, their incoming/outgoing connections, and their role in the system.
For structural questions ("which tables are most connected?", "what has no incoming edges?"), analyze the graph topology.
Format responses with markdown: use **bold** for entity names, \`code\` for IDs and technical terms, bullet lists for enumerations, and tables for comparisons.
Be concise but thorough. Prefer specific answers over vague summaries.`;

const fetchGraphEndpoint = async (endpoint: string): Promise<unknown> => {
  const res = await fetch(`${GRAPH_SERVER_URL}${endpoint}`, {
    signal: AbortSignal.timeout(5_000),
  });
  if (!res.ok) throw new Error(`Graph server returned ${res.status}`);
  return res.json();
};

const queryGraphDataTool = tool({
  description:
    'Query the graph server for real-time data about paths, registry entries, annotations, or the full graph structure. Always call this before answering questions about the graph.',
  inputSchema: z.object({
    endpoint: z
      .enum([
        'paths',
        'registry',
        'annotations',
        'graph',
        'path_detail',
        'flow_detail',
      ])
      .describe(
        'Which data to fetch: ' +
          '"paths" = list all behavioral paths (IDs, names, descriptions), ' +
          '"registry" = all registry entries/procedures with metadata, ' +
          '"annotations" = all annotations on nodes/edges, ' +
          '"graph" = full graph structure (all nodes and edges), ' +
          '"path_detail" = a single path definition with its step sequence (requires pathId), ' +
          '"flow_detail" = flow visualization elements for a specific path (requires pathId)',
      ),
    pathId: z
      .string()
      .optional()
      .describe(
        'Required for path_detail and flow_detail endpoints. The path ID to look up.',
      ),
  }),
  execute: async ({ endpoint, pathId }) => {
    try {
      switch (endpoint) {
        case 'paths':
          return JSON.stringify(await fetchGraphEndpoint('/api/paths'));
        case 'registry':
          return JSON.stringify(await fetchGraphEndpoint('/api/registry'));
        case 'annotations':
          return JSON.stringify(await fetchGraphEndpoint('/api/annotations'));
        case 'graph':
          return JSON.stringify(await fetchGraphEndpoint('/api/graph.json'));
        case 'path_detail': {
          if (!pathId) return 'Error: pathId is required for path_detail';
          return JSON.stringify(
            await fetchGraphEndpoint(
              `/api/paths/${encodeURIComponent(pathId)}`,
            ),
          );
        }
        case 'flow_detail': {
          if (!pathId) return 'Error: pathId is required for flow_detail';
          return JSON.stringify(
            await fetchGraphEndpoint(
              `/api/graph.flow?path=${encodeURIComponent(pathId)}`,
            ),
          );
        }
        default:
          return 'Unknown endpoint';
      }
    } catch (err) {
      return `Error fetching graph data: ${(err as Error).message}`;
    }
  },
});

export const handleChatRequest = async (req: Request): Promise<Response> => {
  // Check API key
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: 'ANTHROPIC_API_KEY not configured' },
      { status: 500 },
    );
  }

  // Rate limiting by IP
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';

  const rateLimitResult = checkRateLimit(ip);
  if (!rateLimitResult.allowed) {
    return Response.json(
      { error: 'Too many requests' },
      {
        status: 429,
        headers: {
          'Retry-After': String(
            Math.ceil(rateLimitResult.resetInMs / 1000),
          ),
        },
      },
    );
  }

  // Parse body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Validate
  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      {
        error: 'Invalid request',
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  // Extract text messages for the model
  const coreMessages = parsed.data.messages
    .map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.parts
        .filter(
          (p): p is { type: 'text'; text: string } =>
            p.type === 'text' &&
            typeof (p as { text?: unknown }).text === 'string',
        )
        .map((p) => p.text)
        .join(''),
    }))
    .filter((m) => m.content.trim().length > 0);

  try {
    const result = streamText({
      model: anthropic('claude-sonnet-4-5-20250929'),
      system: SYSTEM_PROMPT,
      messages: coreMessages,
      tools: {
        queryGraphData: queryGraphDataTool,
      },
      stopWhen: stepCountIs(6),
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error(
      '[chat] Error:',
      error instanceof Error ? error.message : error,
    );
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
};
