/**
 * Static analysis engine that derives Maestro test → graph path coverage
 * from source code, replacing manual GRAPH_PATH_ID annotations.
 *
 * Derivation chain:
 *   Maestro YAML → testIDs used → grep source for testID → component file
 *   → route file imports → route segment → ROUTE_PATH_MAP → graph pathId
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, relative, resolve, dirname } from "node:path";

// Direct import: pure data file with zero external deps, works with tsx
import { ROUTE_PATH_MAP } from "../../../../apps/mobile/src/services/devLiveEmitter/routePathMap/routePathMap";

// ── Paths ──

const MOBILE_ROOT = join(__dirname, "../../../../apps/mobile");
const TABS_DIR = join(MOBILE_ROOT, "app/(tabs)");
const FEATURES_DIR = join(MOBILE_ROOT, "src/features");
const FLOWS_DIR = join(MOBILE_ROOT, "e2e/flows");

// ── Types ──

type DerivedPathEntry = {
  pathId: string;
  steps: number[];
  derivedFrom: string[];
};

type DerivedTestEntry = {
  file: string;
  paths: DerivedPathEntry[];
};

type CoverageEntry = {
  pathId: string;
  testCount: number;
  files: string[];
};

type DerivedManifest = {
  tests: DerivedTestEntry[];
  coverage: CoverageEntry[];
  uncoveredPaths: string[];
};

// ── Hardcoded tab testIDs (stable, defined in app/(tabs)/_layout.tsx) ──

const TAB_TEST_IDS: Record<string, string> = {
  "tab-discover": "(discover)",
  "tab-listings": "(listings)",
  "tab-messages": "(messages)",
  "tab-meetups": "(meetups)",
  "tab-profile": "(profile)",
};

// ── Utility: recursive file walk ──

const walkFiles = (dir: string, ext: string): string[] => {
  const results: string[] = [];
  try {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        results.push(...walkFiles(full, ext));
      } else if (entry.name.endsWith(ext)) {
        results.push(full);
      }
    }
  } catch {
    // dir may not exist
  }
  return results;
};

/** Walk YAML test files, skipping _subflows (included via runFlow). */
const walkYaml = (dir: string): string[] => {
  const results: string[] = [];
  try {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory() && entry.name !== "_subflows") {
        results.push(...walkYaml(full));
      } else if (
        !entry.isDirectory() &&
        (entry.name.endsWith(".yaml") || entry.name.endsWith(".yml"))
      ) {
        results.push(full);
      }
    }
  } catch {
    // flows dir may not exist in CI
  }
  return results;
};

// ── Step 1: Build route segment → component file map ──

/**
 * Parses import statements from a TypeScript/TSX file.
 * Extracts named and default imports with their source modules.
 */
const parseImports = (
  content: string,
): { symbols: string[]; source: string }[] => {
  const results: { symbols: string[]; source: string }[] = [];
  let match: RegExpExecArray | null;

  // Named imports: import { A, B } from 'module'
  const namedRe = /import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]/g;
  while ((match = namedRe.exec(content)) !== null) {
    const symbols = match[1]
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s && !s.startsWith("type "));
    if (symbols.length > 0) {
      results.push({ symbols, source: match[2] });
    }
  }

  // Default imports: import X from 'module'
  const defaultRe = /import\s+(\w+)\s+from\s+['"]([^'"]+)['"]/g;
  while ((match = defaultRe.exec(content)) !== null) {
    results.push({ symbols: [match[1]], source: match[2] });
  }

  return results;
};

/**
 * Resolves a barrel export to the actual component file path.
 * e.g. symbol "ChatThread" from barrel "@/features/chat" →
 *   reads features/chat/index.ts → finds re-export → resolves to .tsx file
 */
const resolveBarrelExport = (
  barrelPath: string,
  symbolName: string,
): string | null => {
  try {
    const content = readFileSync(barrelPath, "utf-8");
    const re = new RegExp(
      `export\\s+\\{\\s*default\\s+as\\s+${symbolName}\\s*\\}\\s+from\\s+['"]([^'"]+)['"]`,
    );
    const match = content.match(re);
    if (match) {
      const resolved = resolve(dirname(barrelPath), match[1]);
      for (const ext of [".tsx", ".ts"]) {
        if (existsSync(resolved + ext)) return resolved + ext;
      }
      if (existsSync(resolved)) return resolved;
    }
  } catch {
    // barrel may not exist
  }
  return null;
};

/**
 * Resolves an import source to actual file path(s).
 * Only processes @/features/ imports; other sources return [].
 */
const resolveImportSource = (
  source: string,
  symbols: string[],
): string[] => {
  if (!source.startsWith("@/features/")) return [];

  const afterFeatures = source.slice("@/features/".length);
  const parts = afterFeatures.split("/");
  const featureName = parts[0];
  const results: string[] = [];

  if (parts.length === 1) {
    // Barrel import: @/features/<feature>
    const barrelPath = join(FEATURES_DIR, featureName, "index.ts");
    for (const sym of symbols) {
      const resolved = resolveBarrelExport(barrelPath, sym);
      if (resolved) results.push(resolved);
    }
  } else {
    // Direct import: @/features/<feature>/components/X/X
    const relPath = parts.slice(1).join("/");
    const basePath = join(FEATURES_DIR, featureName, relPath);
    for (const ext of [".tsx", ".ts"]) {
      if (existsSync(basePath + ext)) {
        results.push(basePath + ext);
        break;
      }
    }
  }

  return results;
};

/**
 * Derives route segment from a route file path.
 * Strips app/(tabs)/ prefix and .tsx suffix; index → parent directory.
 */
const deriveRouteSegment = (routeFilePath: string): string => {
  let seg = relative(TABS_DIR, routeFilePath)
    .replace(/\.tsx$/, "")
    .replace(/\\/g, "/");

  if (seg.endsWith("/index")) {
    seg = seg.slice(0, -"/index".length);
  }

  return seg;
};

/**
 * Builds map from route segment to resolved component file paths.
 * Scans all route files under app/(tabs)/, excluding _layout.tsx.
 */
const buildRouteComponentMap = (): Map<string, string[]> => {
  const routeFiles = walkFiles(TABS_DIR, ".tsx").filter(
    (f) => !f.endsWith("_layout.tsx"),
  );
  const routeMap = new Map<string, string[]>();

  for (const routeFile of routeFiles) {
    const content = readFileSync(routeFile, "utf-8");
    const imports = parseImports(content);
    const segment = deriveRouteSegment(routeFile);
    const componentFiles: string[] = [];

    for (const imp of imports) {
      componentFiles.push(...resolveImportSource(imp.source, imp.symbols));
    }

    if (componentFiles.length > 0) {
      routeMap.set(segment, componentFiles);
    }
  }

  return routeMap;
};

// ── Step 2: Build testID → route segment reverse index ──

/** Extracts testID values from a component file. */
const extractTestIds = (filePath: string): string[] => {
  try {
    const content = readFileSync(filePath, "utf-8");
    const ids: string[] = [];
    let match: RegExpExecArray | null;

    // testID="xxx" (JSX attribute)
    const jsxRe = /testID="([^"]+)"/g;
    while ((match = jsxRe.exec(content)) !== null) {
      ids.push(match[1]);
    }

    // testID: 'xxx' or testID: "xxx" (object literal, e.g. tab config)
    const objRe = /testID:\s*['"]([^'"]+)['"]/g;
    while ((match = objRe.exec(content)) !== null) {
      ids.push(match[1]);
    }

    return [...new Set(ids)];
  } catch {
    return [];
  }
};

/**
 * Builds reverse index: testID → route segment.
 * Includes hardcoded tab testIDs and scanned component testIDs.
 */
const buildTestIdIndex = (
  routeComponentMap: Map<string, string[]>,
): Map<string, string> => {
  const index = new Map<string, string>();

  // Hardcoded tab testIDs
  for (const [testId, segment] of Object.entries(TAB_TEST_IDS)) {
    index.set(testId, segment);
  }

  // Scan component files
  for (const [segment, componentFiles] of routeComponentMap) {
    for (const file of componentFiles) {
      for (const id of extractTestIds(file)) {
        if (!index.has(id)) {
          index.set(id, segment);
        }
      }
    }
  }

  return index;
};

// ── Step 3: Parse Maestro YAML for testID references ──

/**
 * Extracts all testID references from a Maestro YAML file.
 * Recursively follows runFlow references to include subflow testIDs.
 */
const parseMaestroTestIds = (
  yamlFilePath: string,
  visited = new Set<string>(),
): string[] => {
  const abs = resolve(yamlFilePath);
  if (visited.has(abs)) return [];
  visited.add(abs);

  try {
    const content = readFileSync(abs, "utf-8");
    const ids: string[] = [];
    let match: RegExpExecArray | null;

    // Indented id: "xxx" lines (testID refs in tapOn, assertVisible, etc.)
    const idRe = /^\s+id:\s*["']([^"']+)["']/gm;
    while ((match = idRe.exec(content)) !== null) {
      ids.push(match[1]);
    }

    // Recursively follow runFlow references
    const flowRe = /runFlow:\s*["']([^"']+)["']/g;
    while ((match = flowRe.exec(content)) !== null) {
      const subflowPath = resolve(dirname(abs), match[1]);
      ids.push(...parseMaestroTestIds(subflowPath, visited));
    }

    return ids;
  } catch {
    return [];
  }
};

// ── Step 4: Resolve testID → graph path ──

/**
 * Resolves a testID to its graph path mapping via the reverse index
 * and ROUTE_PATH_MAP lookup.
 */
const resolveTestIdToGraphPath = (
  testId: string,
  testIdIndex: Map<string, string>,
): { pathId: string; stepIndex: number; label: string } | null => {
  const segment = testIdIndex.get(testId);
  if (!segment) return null;

  const mapping = ROUTE_PATH_MAP[segment];
  if (!mapping) return null;

  return {
    pathId: mapping.pathId,
    stepIndex: mapping.stepIndex,
    label: mapping.label,
  };
};

// ── Step 5: Build derived manifest ──

/**
 * Builds the complete derived manifest from static code analysis.
 * This is the main entry point that orchestrates the derivation chain.
 */
const buildDerivedManifest = (): DerivedManifest => {
  const routeComponentMap = buildRouteComponentMap();
  const testIdIndex = buildTestIdIndex(routeComponentMap);

  const yamlFiles = walkYaml(FLOWS_DIR);
  const tests: DerivedTestEntry[] = [];

  for (const yamlFile of yamlFiles) {
    const testIds = parseMaestroTestIds(yamlFile);
    if (testIds.length === 0) continue;

    // Resolve each testID → graph path, dedup by pathId
    const pathMap = new Map<
      string,
      { steps: Set<number>; derivedFrom: Set<string> }
    >();

    for (const testId of testIds) {
      const resolved = resolveTestIdToGraphPath(testId, testIdIndex);
      if (!resolved) continue;

      const existing = pathMap.get(resolved.pathId);
      if (existing) {
        existing.steps.add(resolved.stepIndex);
        existing.derivedFrom.add(testId);
      } else {
        pathMap.set(resolved.pathId, {
          steps: new Set([resolved.stepIndex]),
          derivedFrom: new Set([testId]),
        });
      }
    }

    if (pathMap.size > 0) {
      tests.push({
        file: relative(FLOWS_DIR, yamlFile),
        paths: Array.from(pathMap.entries()).map(([pathId, data]) => ({
          pathId,
          steps: Array.from(data.steps).sort((a, b) => a - b),
          derivedFrom: Array.from(data.derivedFrom),
        })),
      });
    }
  }

  // Group coverage by pathId across all tests
  const coverageMap = new Map<string, Set<string>>();
  for (const test of tests) {
    for (const path of test.paths) {
      const existing = coverageMap.get(path.pathId) ?? new Set();
      existing.add(test.file);
      coverageMap.set(path.pathId, existing);
    }
  }

  const coverage: CoverageEntry[] = Array.from(coverageMap.entries()).map(
    ([pathId, files]) => ({
      pathId,
      testCount: files.size,
      files: Array.from(files),
    }),
  );

  return { tests, coverage, uncoveredPaths: [] };
};

export {
  buildDerivedManifest,
  buildRouteComponentMap,
  buildTestIdIndex,
  parseMaestroTestIds,
  resolveTestIdToGraphPath,
};
export type { DerivedManifest, DerivedTestEntry, DerivedPathEntry, CoverageEntry };

// Allow running as standalone script: npx tsx packages/api/src/graph/deriveTestCoverage.ts
if (require.main === module) {
  const manifest = buildDerivedManifest();
  console.log(JSON.stringify(manifest, null, 2));
}
