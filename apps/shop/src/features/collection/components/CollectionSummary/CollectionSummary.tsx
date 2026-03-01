import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/orpc';
import { collectionKeys } from '../../queryKeys';

export const CollectionSummary = () => {
  const { data, isLoading } = useQuery({
    queryKey: collectionKeys.summary(),
    queryFn: () => client.collection.portfolioSummary(),
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl border border-border bg-card" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="text-sm text-muted-foreground">Total Items</div>
        <div className="mt-1 text-2xl font-bold text-foreground">
          {data?.total_items ?? 0}
        </div>
      </div>
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="text-sm text-muted-foreground">Portfolio Value</div>
        <div className="mt-1 text-2xl font-bold text-foreground">
          ${(data?.total_value ?? 0).toFixed(2)}
        </div>
      </div>
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="text-sm text-muted-foreground">TCGs</div>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {(data?.by_tcg ?? []).map((t) => (
            <span
              key={t.tcg}
              className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
            >
              {t.tcg.toUpperCase()} ({t.count})
            </span>
          ))}
          {(data?.by_tcg ?? []).length === 0 && (
            <span className="text-sm text-muted-foreground">None yet</span>
          )}
        </div>
      </div>
    </div>
  );
};
