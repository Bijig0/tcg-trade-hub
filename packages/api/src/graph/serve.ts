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
  listRecordings,
  getRecording,
  upsertRecording,
  deleteRecording,
  listLatestTestRuns,
} from "flow-graph";
import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import { triggerRecording, checkMaestroHealth, RecordingError, type RecordingErrorCode } from "./recordingRunner";
import { runBatchTests, isBatchRunning, abortBatch, killAllActiveProcesses } from "./batchTestRunner";
import { getScenarios } from "./scenarios";
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

// ---------------------------------------------------------------------------
// Security: restrict CORS to localhost origins only
// ---------------------------------------------------------------------------

const ALLOWED_ORIGINS = new Set([
  "http://localhost:3000",  // web app (dev)
  "http://127.0.0.1:3000",
  "http://localhost:3001",  // admin UI (dev)
  "http://127.0.0.1:3001",
  "http://localhost:3004",  // admin UI (alt port)
  "http://127.0.0.1:3004",
  "http://localhost:5173",  // vite default
  "http://127.0.0.1:5173",
  `http://localhost:${PORT}`,
  `http://127.0.0.1:${PORT}`,
]);

const getCorsHeaders = (req: import("node:http").IncomingMessage): Record<string, string> => {
  const origin = req.headers.origin ?? "";
  const allowedOrigin = ALLOWED_ORIGINS.has(origin) ? origin : "";
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin",
  };
};

const execFileAsync = promisify(execFile);

// ---------------------------------------------------------------------------
// Recording file storage
// ---------------------------------------------------------------------------

const RECORDINGS_DIR = join(import.meta.dirname ?? __dirname, "recordings", "files");
if (!existsSync(RECORDINGS_DIR)) {
  mkdirSync(RECORDINGS_DIR, { recursive: true });
}

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

  const corsHeaders = getCorsHeaders(req);

  // CORS preflight
  if (method === "OPTIONS") {
    res.writeHead(204, corsHeaders);
    res.end();
    return;
  }

  const respond = ({ body, status }: { body: string; status: number }) => {
    res.writeHead(status, { "Content-Type": "application/json", ...corsHeaders });
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

    // maestro/health is now served through oRPC at /api/rpc/maestro.health

    if (url.pathname === "/api/maestro/coverage" && method === "GET") {
      const allPathIds = listPaths(db).map((p: { id: string }) => p.id);
      const coveredIds = new Set(maestroManifest.coverage.map((c) => c.pathId));
      const covered = allPathIds.filter((id: string) => coveredIds.has(id));
      const uncovered = allPathIds.filter((id: string) => !coveredIds.has(id));
      respond(json({ covered, uncovered, total: allPathIds.length }));
      return;
    }

    // ---- Scenarios API ----
    if (url.pathname === "/api/scenarios" && method === "GET") {
      const parentPathId = url.searchParams.get("parentPathId") ?? undefined;
      respond(json(getScenarios(parentPathId)));
      return;
    }

    // ---- Recordings API ----
    if (url.pathname === "/api/recordings" && method === "GET") {
      respond(json(listRecordings(db)));
      return;
    }

    const recPathMatch = url.pathname.match(/^\/api\/recordings\/(.+)\/file$/);
    if (recPathMatch && method === "GET") {
      const pathId = decodeURIComponent(recPathMatch[1]);
      const rec = getRecording(db, pathId);
      if (!rec) {
        respond(json({ error: "Recording not found" }, 404));
        return;
      }
      const filePath = join(RECORDINGS_DIR, rec.filename);
      if (!existsSync(filePath)) {
        respond(json({ error: "Recording file missing" }, 404));
        return;
      }
      const data = readFileSync(filePath);
      const ext = rec.filename.split(".").pop()?.toLowerCase() ?? "";
      const contentType = ext === "mp4" ? "video/mp4"
        : ext === "gif" ? "image/gif"
        : ext === "webm" ? "video/webm"
        : "application/octet-stream";
      res.writeHead(200, {
        "Content-Type": contentType,
        "Content-Length": String(data.length),
        ...corsHeaders,
      });
      res.end(data);
      return;
    }

    const recRecordMatch = url.pathname.match(/^\/api\/recordings\/(.+)\/record$/);
    if (recRecordMatch && method === "POST") {
      const pathId = decodeURIComponent(recRecordMatch[1]);
      try {
        const result = await triggerRecording(db, pathId, RECORDINGS_DIR);
        respond(json(result, 201));
      } catch (err) {
        console.error("Recording error:", err);
        if (err instanceof RecordingError) {
          respond(json({ error: err.message, code: err.code, hint: err.hint }, 500));
        } else {
          respond(json({ error: (err as Error).message, code: "UNKNOWN", hint: "" }, 500));
        }
      }
      return;
    }

    const recDetailMatch = url.pathname.match(/^\/api\/recordings\/(.+)$/);
    if (recDetailMatch && method === "GET") {
      const pathId = decodeURIComponent(recDetailMatch[1]);
      const rec = getRecording(db, pathId);
      respond(rec ? json(rec) : json({ error: "Not found" }, 404));
      return;
    }

    if (recDetailMatch && method === "POST") {
      const pathId = decodeURIComponent(recDetailMatch[1]);
      const body = await readBody(req);

      // Support JSON body with base64-encoded file data
      const parsed = JSON.parse(body);
      const { filename, durationMs, stepTimestamps, fileData } = parsed;

      if (!filename) {
        respond(json({ error: "Missing filename" }, 400));
        return;
      }

      // Write file if base64 data is provided
      if (fileData) {
        const buffer = Buffer.from(fileData, "base64");
        writeFileSync(join(RECORDINGS_DIR, filename), buffer);
      }

      const rec = upsertRecording(db, {
        pathId,
        filename,
        durationMs: durationMs ?? null,
        stepTimestamps: stepTimestamps ?? [],
      });
      respond(json(rec, 201));
      return;
    }

    if (recDetailMatch && method === "DELETE") {
      const pathId = decodeURIComponent(recDetailMatch[1]);
      const rec = getRecording(db, pathId);
      if (rec) {
        const filePath = join(RECORDINGS_DIR, rec.filename);
        if (existsSync(filePath)) {
          try { unlinkSync(filePath); } catch { /* noop */ }
        }
      }
      const deleted = deleteRecording(db, pathId);
      respond(deleted ? json({ ok: true }) : json({ error: "Not found" }, 404));
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
      // Set CORS headers before oRPC writes its own response
      for (const [key, value] of Object.entries(corsHeaders)) {
        res.setHeader(key, value);
      }
      const { matched } = await rpcHandler.handle(req, res, {
        prefix: "/api/rpc",
        context: {
          getWsClientCount: () => wsClients.size,
          getPathCount: () => listPaths(db).length,
          getMaestroHealth: () => checkMaestroHealth(),
          triggerMaestroRecording: async (pathId) => {
            try {
              const recording = await triggerRecording(db, pathId, RECORDINGS_DIR);
              return {
                ok: true as const,
                recording: {
                  id: recording.id,
                  pathId: recording.pathId,
                  filename: recording.filename,
                  durationMs: recording.durationMs,
                  stepTimestamps: recording.stepTimestamps,
                  createdAt: recording.createdAt,
                },
              };
            } catch (err) {
              if (err instanceof RecordingError) {
                return {
                  ok: false as const,
                  error: err.message,
                  code: err.code,
                  hint: err.hint,
                };
              }
              return { ok: false as const, error: (err as Error).message, code: "UNKNOWN" as const, hint: "" };
            }
          },
          getLatestTestRuns: () => listLatestTestRuns(db),
          triggerBatchTest: async (mode) => {
            return runBatchTests(db, RECORDINGS_DIR, {
              mode,
              onProgress: (event) => {
                const payload = JSON.stringify(event);
                wsClients.forEach((ws) => {
                  try { ws.send(payload); } catch { /* noop */ }
                });
              },
              onLog: (event) => {
                const payload = JSON.stringify(event);
                wsClients.forEach((ws) => {
                  try { ws.send(payload); } catch { /* noop */ }
                });
              },
            });
          },
          isBatchRunning: () => isBatchRunning(),
          abortBatch: () => abortBatch(),
          resetBatchState: () => {
            killAllActiveProcesses();
          },
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

server.listen(PORT, "127.0.0.1", () => {
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
  console.log(`  Recordings:http://localhost:${PORT}/api/recordings`);
});

// ---------------------------------------------------------------------------
// Graceful shutdown — kill orphaned maestro processes
// ---------------------------------------------------------------------------

process.on("SIGTERM", () => {
  killAllActiveProcesses();
  process.exit(0);
});

process.on("SIGINT", () => {
  killAllActiveProcesses();
  process.exit(0);
});
