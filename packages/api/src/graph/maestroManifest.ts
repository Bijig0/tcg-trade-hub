/**
 * Scans Maestro YAML flow files for GRAPH_PATH_ID env annotations
 * and produces a manifest mapping tests to graph paths.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

type TestEntry = {
  file: string;
  pathId: string;
};

type CoverageEntry = {
  pathId: string;
  testCount: number;
  files: string[];
};

type MaestroManifest = {
  tests: TestEntry[];
  coverage: CoverageEntry[];
  uncoveredPaths: string[];
};

const FLOWS_DIR = join(__dirname, "../../../../apps/mobile/e2e/flows");

const walkYaml = (dir: string): string[] => {
  const results: string[] = [];
  try {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        results.push(...walkYaml(full));
      } else if (entry.name.endsWith(".yaml") || entry.name.endsWith(".yml")) {
        results.push(full);
      }
    }
  } catch {
    // flows dir may not exist in CI
  }
  return results;
};

const GRAPH_PATH_RE = /^\s*GRAPH_PATH_ID:\s*["']?([^"'\s]+)["']?\s*$/m;

const parseGraphPathId = (content: string): string | null => {
  const match = content.match(GRAPH_PATH_RE);
  return match ? match[1] : null;
};

/**
 * Builds the Maestro test manifest by scanning YAML flow files.
 */
export const buildMaestroManifest = (): MaestroManifest => {
  const yamlFiles = walkYaml(FLOWS_DIR);
  const tests: TestEntry[] = [];

  for (const file of yamlFiles) {
    const content = readFileSync(file, "utf-8");
    const pathId = parseGraphPathId(content);
    if (pathId) {
      tests.push({ file: relative(FLOWS_DIR, file), pathId });
    }
  }

  // Group by pathId
  const byPath = new Map<string, string[]>();
  for (const t of tests) {
    const existing = byPath.get(t.pathId) ?? [];
    existing.push(t.file);
    byPath.set(t.pathId, existing);
  }

  const coverage: CoverageEntry[] = Array.from(byPath.entries()).map(
    ([pathId, files]) => ({ pathId, testCount: files.length, files }),
  );

  return { tests, coverage, uncoveredPaths: [] };
};

// Allow running as standalone script: npx tsx packages/api/src/graph/maestroManifest.ts
if (require.main === module) {
  const manifest = buildMaestroManifest();
  console.log(JSON.stringify(manifest, null, 2));
}
