import { createFileRoute, Link } from '@tanstack/react-router';
import { CollectionSummary } from '@/features/collection/components/CollectionSummary/CollectionSummary';
import { CollectionTable } from '@/features/collection/components/CollectionTable/CollectionTable';

export const Route = createFileRoute('/_authed/dashboard/collection/')({
  component: CollectionPage,
});

function CollectionPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Collection</h2>
        <div className="flex gap-2">
          <Link
            to="/dashboard/collection/import"
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Import CSV
          </Link>
          <Link
            to="/dashboard/collection/add"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Add Card
          </Link>
        </div>
      </div>
      <CollectionSummary />
      <CollectionTable />
    </div>
  );
}
