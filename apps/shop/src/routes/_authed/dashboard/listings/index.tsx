import { createFileRoute, Link } from '@tanstack/react-router';
import { ListingsTable } from '@/features/listings/components/ListingsTable/ListingsTable';

export const Route = createFileRoute('/_authed/dashboard/listings/')({
  component: ListingsPage,
});

function ListingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Listings</h2>
        <Link
          to="/dashboard/listings/new"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Create Listing
        </Link>
      </div>
      <ListingsTable />
    </div>
  );
}
