/**
 * Maestro test manifest with graph path coverage derived from code analysis.
 * Coverage is determined by static analysis of testIDs in source code,
 * not manual GRAPH_PATH_ID annotations.
 */
import { buildDerivedManifest } from "./deriveTestCoverage";
import type { CoverageEntry } from "./deriveTestCoverage";

type TestEntry = {
  file: string;
  pathId: string;
};

type MaestroManifest = {
  tests: TestEntry[];
  coverage: CoverageEntry[];
  uncoveredPaths: string[];
};

/**
 * Builds the Maestro test manifest by deriving graph path coverage
 * from static analysis of source code (testIDs → routes → graph paths).
 */
const buildMaestroManifest = (): MaestroManifest => {
  const derived = buildDerivedManifest();

  // Flatten DerivedTestEntry[] → TestEntry[] for backward compat
  const tests: TestEntry[] = [];
  for (const test of derived.tests) {
    for (const path of test.paths) {
      tests.push({ file: test.file, pathId: path.pathId });
    }
  }

  return {
    tests,
    coverage: derived.coverage,
    uncoveredPaths: derived.uncoveredPaths,
  };
};

export { buildMaestroManifest };
export type { MaestroManifest, TestEntry };

// Re-export richer types for consumers that want step-level detail
export { buildDerivedManifest } from "./deriveTestCoverage";
export type {
  DerivedManifest,
  DerivedTestEntry,
  DerivedPathEntry,
} from "./deriveTestCoverage";

// Allow running as standalone script: npx tsx packages/api/src/graph/maestroManifest.ts
if (require.main === module) {
  const manifest = buildMaestroManifest();
  console.log(JSON.stringify(manifest, null, 2));
}
