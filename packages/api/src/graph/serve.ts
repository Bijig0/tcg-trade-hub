/**
 * Node.js-compatible graph API server.
 * Serves the same endpoints as flow-graph's Bun server so GraphViewer works.
 * Includes live event ingestion, WebSocket broadcast, and Maestro manifest.
 */
import { createServer } from "node:http";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import {
  openDb,
  generateGraphData,
  generateCompactElements,
  generateFlowElements,
  buildFlowMeta,
  listPaths,
  getPath,
  listRegistryEntries,
  listAnnotations,
  upsertAnnotation,
  deleteAnnotation,
  createLiveEventStore,
} from "flow-graph";
import { WebSocketServer, type WebSocket } from "ws";
import { z } from "zod";
import { buildMaestroManifest } from "./maestroManifest";
import { RPCHandler } from "@orpc/server/node";
import { onError } from "@orpc/server";
import { graphRouter } from "./graphRouter";

const PORT = Number(process.env.GRAPH_PORT) || 4243;
const DB_PATH = process.env.GRAPH_DB_PATH;

const db = openDb(DB_PATH);

// ---------------------------------------------------------------------------
// Live event store + WebSocket
// ---------------------------------------------------------------------------

const liveEvents = createLiveEventStore(500);
const wsClients = new Set<WebSocket>();

liveEvents.subscribe((event) => {
  const payload = JSON.stringify(event);
  wsClients.forEach((ws) => {
    try {
      ws.send(payload);
    } catch {
      // ignore send errors on stale sockets
    }
  });
});

// ---------------------------------------------------------------------------
// Maestro manifest (built once at startup)
// ---------------------------------------------------------------------------

const maestroManifest = buildMaestroManifest();

// ---------------------------------------------------------------------------
// oRPC handler (type-safe graph status endpoint)
// ---------------------------------------------------------------------------

const rpcHandler = new RPCHandler(graphRouter, {
  interceptors: [
    onError((error) => {
      console.error("[oRPC Error]", error);
    }),
  ],
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const json = (data: unknown, status = 200) =>
  ({ body: JSON.stringify(data, null, 2), status });

const readBody = (req: import("node:http").IncomingMessage): Promise<string> =>
  new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (c: Buffer) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks).toString()));
    req.on("error", reject);
  });

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const execFileAsync = promisify(execFile);

// ---------------------------------------------------------------------------
// Simulator helpers
// ---------------------------------------------------------------------------

const UDID_PATTERN = /^[0-9A-F-]{36}$/i;

const SimctlDeviceSchema = z.object({
  udid: z.string(),
  name: z.string(),
  state: z.string(),
});

const SimctlOutputSchema = z.object({
  devices: z.record(z.string(), z.array(SimctlDeviceSchema)),
});

const VALID_STATES = new Set(["Booted", "Shutdown", "Shutting Down"]);

type SimulatorDevice = {
  udid: string;
  name: string;
  state: "Booted" | "Shutdown" | "Shutting Down";
  runtime: string;
};

const listSimulators = async (): Promise<SimulatorDevice[]> => {
  const { stdout } = await execFileAsync("xcrun", [
    "simctl",
    "list",
    "devices",
    "available",
    "--json",
  ], { timeout: 10_000 });
  const parsed = SimctlOutputSchema.parse(JSON.parse(stdout));

  const devices: SimulatorDevice[] = [];
  for (const [runtimeId, runtimeDevices] of Object.entries(parsed.devices)) {
    const runtime = runtimeId.replace("com.apple.CoreSimulator.SimRuntime.", "").replace(/-/g, " ");
    for (const d of runtimeDevices) {
      devices.push({
        udid: d.udid,
        name: d.name,
        state: VALID_STATES.has(d.state) ? d.state as SimulatorDevice["state"] : "Shutdown",
        runtime,
      });
    }
  }

  // Booted first, then alphabetical by name
  devices.sort((a, b) => {
    if (a.state === "Booted" && b.state !== "Booted") return -1;
    if (a.state !== "Booted" && b.state === "Booted") return 1;
    return a.name.localeCompare(b.name);
  });

  return devices;
};

const bootSimulator = async (udid: string): Promise<{ name: string }> => {
  // Get device name first
  const devices = await listSimulators();
  const device = devices.find((d) => d.udid === udid);
  if (!device) throw new Error(`Simulator ${udid} not found`);

  if (device.state !== "Booted") {
    await execFileAsync("xcrun", ["simctl", "boot", udid], { timeout: 30_000 });
  }

  // Bring Simulator.app to foreground
  await execFileAsync("open", ["-a", "Simulator"], { timeout: 5_000 });

  return { name: device.name };
};

// ---------------------------------------------------------------------------
// HTTP server
// ---------------------------------------------------------------------------

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://localhost:${PORT}`);
  const method = req.method ?? "GET";

  // CORS preflight
  if (method === "OPTIONS") {
    res.writeHead(204, CORS_HEADERS);
    res.end();
    return;
  }

  const respond = ({ body, status }: { body: string; status: number }) => {
    res.writeHead(status, { "Content-Type": "application/json", ...CORS_HEADERS });
    res.end(body);
  };

  try {
    // ---- Health ----
    if (url.pathname === "/api/health") {
      respond(json({ ok: true, timestamp: Date.now(), wsClients: wsClients.size }));
      return;
    }

    // ---- Live Events API ----
    if (url.pathname === "/api/events" && method === "POST") {
      const body = JSON.parse(await readBody(req));
      const { pathId, stepIndex, status, traceId } = body;
      if (!pathId || stepIndex == null || !status || !traceId) {
        respond(json({ error: "Missing required fields: pathId, stepIndex, status, traceId" }, 400));
        return;
      }
      const event = {
        pathId,
        stepIndex: Number(stepIndex),
        status,
        traceId,
        timestamp: body.timestamp ?? Date.now(),
        operationId: body.operationId,
        message: body.message,
        caller: body.caller,
      };
      liveEvents.add(event);
      respond(json({ ok: true }, 201));
      return;
    }

    if (url.pathname === "/api/events/recent" && method === "GET") {
      const limit = Number(url.searchParams.get("limit")) || 100;
      respond(json(liveEvents.getRecent(limit)));
      return;
    }

    const traceMatch = url.pathname.match(/^\/api\/events\/trace\/(.+)$/);
    if (traceMatch && method === "GET") {
      const traceId = decodeURIComponent(traceMatch[1]);
      respond(json(liveEvents.getByTrace(traceId)));
      return;
    }

    // ---- Registry API ----
    if (url.pathname === "/api/registry" && method === "GET") {
      respond(json(listRegistryEntries(db)));
      return;
    }

    // ---- Paths API ----
    if (url.pathname === "/api/paths" && method === "GET") {
      respond(json(listPaths(db)));
      return;
    }

    const pathMatch = url.pathname.match(/^\/api\/paths\/(.+)$/);
    if (pathMatch && method === "GET") {
      const id = decodeURIComponent(pathMatch[1]);
      const path = getPath(db, id);
      respond(path ? json(path) : json({ error: "Not found" }, 404));
      return;
    }

    // ---- Annotations API ----
    if (url.pathname === "/api/annotations" && method === "GET") {
      const targetType = url.searchParams.get("target_type") ?? undefined;
      const targetId = url.searchParams.get("target_id") ?? undefined;
      respond(
        json(
          listAnnotations(db, {
            targetType: targetType as "node" | "edge" | undefined,
            targetId,
          }),
        ),
      );
      return;
    }

    if (url.pathname === "/api/annotations" && method === "POST") {
      const body = JSON.parse(await readBody(req));
      upsertAnnotation(db, body);
      respond(json({ ok: true }, 201));
      return;
    }

    if (url.pathname === "/api/annotations/bulk" && method === "POST") {
      const body = JSON.parse(await readBody(req)) as Array<{
        targetType: string;
        targetId: string;
        field: string;
        value: string;
      }>;
      for (const ann of body) {
        upsertAnnotation(db, ann as Parameters<typeof upsertAnnotation>[1]);
      }
      respond(json({ ok: true }, 201));
      return;
    }

    const annMatch = url.pathname.match(/^\/api\/annotations\/(\d+)$/);
    if (annMatch && method === "DELETE") {
      deleteAnnotation(db, Number(annMatch[1]));
      respond(json({ ok: true }));
      return;
    }

    // ---- Graph data API ----
    if (url.pathname === "/api/graph.json") {
      respond(json(generateGraphData(db)));
      return;
    }

    if (url.pathname === "/api/graph.cytoscape") {
      const pathId = url.searchParams.get("path") ?? undefined;
      respond(json(generateCompactElements(pathId, db)));
      return;
    }

    // ---- Flow elements API ----
    if (url.pathname === "/api/graph.flow" && method === "GET") {
      const pathId = url.searchParams.get("path");
      if (!pathId) {
        respond(json({ error: "Missing ?path= parameter" }, 400));
        return;
      }
      const pathDef = getPath(db, pathId);
      if (!pathDef) {
        respond(json({ error: "Path not found" }, 404));
        return;
      }
      const elements = generateFlowElements(pathId, db);
      const flowMeta = buildFlowMeta(pathDef, db);
      respond(json({ elements, flowMeta }));
      return;
    }

    // ---- Maestro Manifest API ----
    if (url.pathname === "/api/maestro/manifest" && method === "GET") {
      respond(json(maestroManifest));
      return;
    }

    if (url.pathname === "/api/maestro/coverage" && method === "GET") {
      const allPathIds = listPaths(db).map((p: { id: string }) => p.id);
      const coveredIds = new Set(maestroManifest.coverage.map((c) => c.pathId));
      const covered = allPathIds.filter((id: string) => coveredIds.has(id));
      const uncovered = allPathIds.filter((id: string) => !coveredIds.has(id));
      respond(json({ covered, uncovered, total: allPathIds.length }));
      return;
    }

    // ---- Simulator API ----
    if (url.pathname === "/api/simulators" && method === "GET") {
      try {
        const devices = await listSimulators();
        respond(json(devices));
      } catch (err) {
        console.error("listSimulators error:", err);
        respond(json({ error: "Failed to list simulators" }, 500));
      }
      return;
    }

    const simBootMatch = url.pathname.match(/^\/api\/simulators\/([^/]+)\/boot$/);
    if (simBootMatch && method === "POST") {
      const udid = decodeURIComponent(simBootMatch[1]);
      if (!UDID_PATTERN.test(udid)) {
        respond(json({ error: "Invalid UDID format" }, 400));
        return;
      }
      try {
        const { name } = await bootSimulator(udid);
        respond(json({ ok: true, udid, name }));
      } catch (err) {
        console.error("bootSimulator error:", err);
        respond(json({ error: "Failed to boot simulator" }, 500));
      }
      return;
    }

    // ---- WebSocket client count (used by mobile DevAdminLink) ----
    if (url.pathname === "/api/ws/clients" && method === "GET") {
      respond(json({ count: wsClients.size }));
      return;
    }

    // ---- oRPC handler ----
    if (url.pathname.startsWith("/api/rpc")) {
      const { matched } = await rpcHandler.handle(req, res, {
        prefix: "/api/rpc",
        context: {
          getWsClientCount: () => wsClients.size,
          getPathCount: () => listPaths(db).length,
        },
      });
      if (matched) return;
    }

    // ---- 404 ----
    respond(json({ error: "Not found", path: url.pathname }, 404));
  } catch (err) {
    console.error("Server error:", err);
    respond(json({ error: "Internal server error" }, 500));
  }
});

// ---------------------------------------------------------------------------
// WebSocket upgrade on /ws/live
// ---------------------------------------------------------------------------

const wss = new WebSocketServer({ noServer: true });

server.on("upgrade", (req, socket, head) => {
  const url = new URL(req.url ?? "/", `http://localhost:${PORT}`);
  if (url.pathname === "/ws/live") {
    wss.handleUpgrade(req, socket, head, (ws) => {
      wsClients.add(ws);
      ws.on("close", () => wsClients.delete(ws));
      ws.on("error", () => wsClients.delete(ws));
    });
  } else {
    socket.destroy();
  }
});

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------

server.listen(PORT, () => {
  console.log(`Graph API server running at http://localhost:${PORT}`);
  console.log(`  JSON:      http://localhost:${PORT}/api/graph.json`);
  console.log(`  Cytoscape: http://localhost:${PORT}/api/graph.cytoscape`);
  console.log(`  Paths API: http://localhost:${PORT}/api/paths`);
  console.log(`  Registry:  http://localhost:${PORT}/api/registry`);
  console.log(`  Health:    http://localhost:${PORT}/api/health`);
  console.log(`  Live WS:   ws://localhost:${PORT}/ws/live`);
  console.log(`  Events:    http://localhost:${PORT}/api/events (POST)`);
  console.log(`  Maestro:   http://localhost:${PORT}/api/maestro/manifest`);
  console.log(`  Sims:      http://localhost:${PORT}/api/simulators`);
});
