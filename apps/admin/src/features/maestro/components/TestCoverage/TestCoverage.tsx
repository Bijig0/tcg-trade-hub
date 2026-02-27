import { useState, useEffect, useCallback } from 'react';

const GRAPH_SERVER_URL = 'http://localhost:4243';

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

type CoverageData = {
  covered: string[];
  uncovered: string[];
  total: number;
};

type TestCoverageProps = {
  isOpen: boolean;
  onToggle: () => void;
};

const TestCoverage = ({ isOpen, onToggle }: TestCoverageProps) => {
  const [manifest, setManifest] = useState<MaestroManifest | null>(null);
  const [coverage, setCoverage] = useState<CoverageData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [manifestRes, coverageRes] = await Promise.all([
        fetch(`${GRAPH_SERVER_URL}/api/maestro/manifest`, {
          signal: AbortSignal.timeout(4_000),
        }),
        fetch(`${GRAPH_SERVER_URL}/api/maestro/coverage`, {
          signal: AbortSignal.timeout(4_000),
        }),
      ]);

      if (!manifestRes.ok || !coverageRes.ok) {
        throw new Error('Failed to fetch Maestro data');
      }

      setManifest(await manifestRes.json());
      setCoverage(await coverageRes.json());
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  useEffect(() => {
    if (isOpen) fetchData();
  }, [isOpen, fetchData]);

  return (
    <div
      className={`flex flex-col border-l border-border bg-card transition-all duration-200 ${
        isOpen ? 'w-80' : 'w-0'
      } overflow-hidden`}
    >
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <span className="text-sm font-medium text-foreground">
          Maestro Test Coverage
        </span>
        <button
          onClick={onToggle}
          className="rounded p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          title="Close panel"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {error && (
          <div className="mb-3 rounded-md border border-destructive/30 bg-destructive/10 p-2 text-xs text-destructive">
            {error}
          </div>
        )}

        {coverage && (
          <div className="mb-4 grid grid-cols-3 gap-2">
            <div className="rounded-md bg-secondary p-2 text-center">
              <div className="text-lg font-semibold text-foreground">{coverage.total}</div>
              <div className="text-xs text-muted-foreground">Total Paths</div>
            </div>
            <div className="rounded-md bg-success/10 p-2 text-center">
              <div className="text-lg font-semibold text-success">{coverage.covered.length}</div>
              <div className="text-xs text-muted-foreground">Covered</div>
            </div>
            <div className="rounded-md bg-destructive/10 p-2 text-center">
              <div className="text-lg font-semibold text-destructive">{coverage.uncovered.length}</div>
              <div className="text-xs text-muted-foreground">Uncovered</div>
            </div>
          </div>
        )}

        {manifest && manifest.coverage.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Covered Paths
            </h3>
            {manifest.coverage.map((entry) => (
              <div
                key={entry.pathId}
                className="rounded-md border border-success/30 bg-success/5 p-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground">
                    {entry.pathId}
                  </span>
                  <span className="rounded-full bg-success/20 px-1.5 py-0.5 text-xs text-success">
                    {entry.testCount} test{entry.testCount !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="mt-1 space-y-0.5">
                  {entry.files.map((file) => (
                    <div key={file} className="truncate text-xs text-muted-foreground">
                      {file}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {coverage && coverage.uncovered.length > 0 && (
          <div className="mt-3 space-y-2">
            <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Uncovered Paths
            </h3>
            {coverage.uncovered.map((pathId) => (
              <div
                key={pathId}
                className="rounded-md border border-destructive/30 bg-destructive/5 p-2"
              >
                <span className="text-xs font-medium text-foreground">{pathId}</span>
                <div className="text-xs text-muted-foreground">No Maestro tests</div>
              </div>
            ))}
          </div>
        )}

        {!manifest && !error && (
          <div className="flex items-center justify-center py-8">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted border-t-primary" />
          </div>
        )}
      </div>
    </div>
  );
};

export default TestCoverage;
