#!/usr/bin/env node
// @ts-check

/**
 * Dev-only bridge server that lets the mobile app boot a second iOS simulator.
 * React Native can't execute shell commands on the host, so this HTTP server
 * acts as a relay between the in-app "Launch 2nd Simulator" button and xcrun.
 *
 * Endpoints:
 *   GET  /status      → { ok: true }
 *   GET  /simulators  → list of available iPhone sims
 *   POST /launch      → boot the best available shutdown iPhone + open Expo
 *   POST /shutdown    → shut down the previously launched sim
 *
 * Usage: node apps/mobile/scripts/dev-sim-server.js
 */

const http = require('http');
const { execSync, exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const PORT = 8083;
const EXPO_PORT = 8082;
const EXPO_GO_BUNDLE_ID = 'host.exp.Exponent';

// Preference order — same ranking as scripts/dev.sh
const SIM_PREFERENCES = [
  'iPhone 16 Pro Max',
  'iPhone 16 Pro',
  'iPhone 16 Plus',
  'iPhone 16',
  'iPhone 15 Pro Max',
  'iPhone 15 Pro',
  'iPhone 15',
  'iPhone 14 Pro Max',
  'iPhone 14',
];

/** @type {{ udid: string; name: string } | null} */
let launchedSim = null;

// ── helpers ───────────────────────────────────────────────────────────

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const json = (res, status, body) => {
  res.writeHead(status, { ...corsHeaders, 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
};

/**
 * Parse `xcrun simctl list devices -j` and return iPhone simulators.
 * Each entry: { udid, name, state, isAvailable }
 */
const listIPhoneSims = () => {
  const raw = execSync('xcrun simctl list devices -j', { encoding: 'utf-8' });
  const data = JSON.parse(raw);
  const sims = [];
  for (const [runtime, devices] of Object.entries(data.devices)) {
    if (!runtime.includes('iOS')) continue;
    for (const d of devices) {
      if (!d.isAvailable || !d.name.includes('iPhone')) continue;
      sims.push({
        udid: d.udid,
        name: d.name,
        state: d.state,
      });
    }
  }
  return sims;
};

/**
 * Pick the best shutdown iPhone sim that isn't already booted.
 * Returns { udid, name } or null.
 */
const pickBestSim = () => {
  const sims = listIPhoneSims();
  const shutdownSims = sims.filter((s) => s.state === 'Shutdown');

  // Rank by preference order
  const ranked = shutdownSims
    .map((s) => {
      const rank = SIM_PREFERENCES.findIndex((pref) => s.name.includes(pref));
      return { ...s, rank: rank === -1 ? SIM_PREFERENCES.length : rank };
    })
    .sort((a, b) => a.rank - b.rank);

  return ranked.length > 0 ? { udid: ranked[0].udid, name: ranked[0].name } : null;
};

/**
 * Find the Expo Go .app bundle from any simulator that already has it installed.
 * Searches CoreSimulator device directories for the app bundle.
 * Returns the absolute path or null.
 */
const findExpoGoApp = () => {
  const simDevicesDir = path.join(
    process.env.HOME,
    'Library/Developer/CoreSimulator/Devices',
  );
  if (!fs.existsSync(simDevicesDir)) return null;

  // Check all booted sims first (more likely to have it), then all others
  const sims = listIPhoneSims();
  const bootedUdids = sims.filter((s) => s.state === 'Booted').map((s) => s.udid);
  const allUdids = [...bootedUdids, ...sims.filter((s) => s.state !== 'Booted').map((s) => s.udid)];

  for (const udid of allUdids) {
    const bundleDir = path.join(simDevicesDir, udid, 'data/Containers/Bundle/Application');
    if (!fs.existsSync(bundleDir)) continue;

    try {
      const appDirs = fs.readdirSync(bundleDir);
      for (const appDir of appDirs) {
        const appPath = path.join(bundleDir, appDir);
        const entries = fs.readdirSync(appPath);
        const expoApp = entries.find(
          (e) => e.startsWith('Expo') && e.endsWith('.app'),
        );
        if (expoApp) {
          return path.join(appPath, expoApp);
        }
      }
    } catch {
      // permission errors, missing dirs — skip
    }
  }
  return null;
};

/**
 * Ensure Expo Go is installed on the target simulator.
 * If not present, copies it from another sim that has it.
 * Returns true if Expo Go is available, false otherwise.
 */
const ensureExpoGo = (targetUdid) => {
  // Check if already installed
  try {
    const output = execSync(
      `xcrun simctl listapps "${targetUdid}" 2>/dev/null`,
      { encoding: 'utf-8' },
    );
    if (output.includes(EXPO_GO_BUNDLE_ID)) {
      console.log('Expo Go already installed on target simulator');
      return true;
    }
  } catch {
    // listapps may fail if sim just booted — continue to install
  }

  // Find Expo Go from another simulator
  const appPath = findExpoGoApp();
  if (!appPath) {
    console.warn('Could not find Expo Go on any simulator. Install it on your primary sim first.');
    return false;
  }

  console.log(`Installing Expo Go from: ${appPath}`);
  try {
    execSync(`xcrun simctl install "${targetUdid}" "${appPath}"`);
    console.log('Expo Go installed successfully');
    return true;
  } catch (err) {
    console.warn(`Failed to install Expo Go: ${err.message}`);
    return false;
  }
};

/**
 * Wait for a simulator to reach the Booted state (up to ~30s).
 */
const waitForBoot = (udid, maxWaitMs = 30000) =>
  new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      try {
        const raw = execSync('xcrun simctl list devices -j', { encoding: 'utf-8' });
        const data = JSON.parse(raw);
        for (const devices of Object.values(data.devices)) {
          for (const d of devices) {
            if (d.udid === udid && d.state === 'Booted') {
              return resolve(undefined);
            }
          }
        }
      } catch {
        // ignore parse errors during boot
      }
      if (Date.now() - start > maxWaitMs) {
        return reject(new Error('Simulator boot timed out'));
      }
      setTimeout(check, 1000);
    };
    check();
  });

// ── request handler ───────────────────────────────────────────────────

const handler = async (req, res) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders);
    return res.end();
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);

  // GET /status
  if (req.method === 'GET' && url.pathname === '/status') {
    return json(res, 200, {
      ok: true,
      launchedSim: launchedSim ? { udid: launchedSim.udid, name: launchedSim.name } : null,
    });
  }

  // GET /simulators
  if (req.method === 'GET' && url.pathname === '/simulators') {
    try {
      const sims = listIPhoneSims();
      return json(res, 200, { sims });
    } catch (err) {
      return json(res, 500, { error: err.message });
    }
  }

  // POST /launch
  if (req.method === 'POST' && url.pathname === '/launch') {
    if (launchedSim) {
      return json(res, 409, {
        error: 'A second simulator is already running',
        sim: launchedSim,
      });
    }

    const sim = pickBestSim();
    if (!sim) {
      return json(res, 404, {
        error: 'No available shutdown iPhone simulator found. All may already be booted.',
      });
    }

    try {
      console.log(`Booting simulator: ${sim.name} (${sim.udid})`);
      execSync(`xcrun simctl boot "${sim.udid}"`);

      // Open Simulator.app so the window appears
      exec('open -a Simulator');

      // Wait for the sim to finish booting
      await waitForBoot(sim.udid);

      // Ensure Expo Go is installed, then open it
      const hasExpoGo = ensureExpoGo(sim.udid);
      if (hasExpoGo) {
        // Small delay to let the sim UI settle after boot + install
        await new Promise((r) => setTimeout(r, 2000));
        try {
          execSync(
            `xcrun simctl openurl "${sim.udid}" exp://localhost:${EXPO_PORT}`,
          );
        } catch {
          console.warn('Could not open Expo Go URL — you may need to open it manually');
        }
      } else {
        console.warn(
          'Expo Go not available. Install it on your primary simulator first, ' +
            'then relaunch. The 2nd sim will pick it up automatically.',
        );
      }

      launchedSim = { udid: sim.udid, name: sim.name };
      console.log(`Simulator ready: ${sim.name}`);
      return json(res, 200, { ok: true, sim: launchedSim });
    } catch (err) {
      return json(res, 500, { error: `Failed to boot simulator: ${err.message}` });
    }
  }

  // POST /shutdown
  if (req.method === 'POST' && url.pathname === '/shutdown') {
    if (!launchedSim) {
      return json(res, 404, { error: 'No second simulator is currently running' });
    }

    try {
      console.log(`Shutting down simulator: ${launchedSim.name}`);
      execSync(`xcrun simctl shutdown "${launchedSim.udid}"`);
      const name = launchedSim.name;
      launchedSim = null;
      return json(res, 200, { ok: true, message: `Shut down ${name}` });
    } catch (err) {
      // If it's already shut down, clear our state anyway
      launchedSim = null;
      return json(res, 200, { ok: true, message: 'Simulator already shut down' });
    }
  }

  // 404 fallback
  json(res, 404, { error: 'Not found' });
};

// ── server lifecycle ──────────────────────────────────────────────────

if (process.platform !== 'darwin') {
  console.error('This server requires macOS (for xcrun simctl).');
  process.exit(1);
}

const server = http.createServer(handler);

const shutdown = () => {
  console.log('\nShutting down...');
  if (launchedSim) {
    try {
      console.log(`Shutting down simulator: ${launchedSim.name}`);
      execSync(`xcrun simctl shutdown "${launchedSim.udid}"`);
    } catch {
      // already shut down
    }
    launchedSim = null;
  }
  server.close(() => process.exit(0));
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

server.listen(PORT, () => {
  console.log(`Dev simulator server listening on http://localhost:${PORT}`);
  console.log('Endpoints:');
  console.log('  GET  /status      — health check');
  console.log('  GET  /simulators  — list available iPhone sims');
  console.log('  POST /launch      — boot 2nd simulator + open Expo');
  console.log('  POST /shutdown    — shut down 2nd simulator');
});
