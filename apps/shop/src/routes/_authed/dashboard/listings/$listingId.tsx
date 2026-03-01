import { createFileRoute, Link } from '@tanstack/react-router';
import { ListingDetail } from '@/features/listings/components/ListingDetail/ListingDetail';

export const Route = createFileRoute('/_authed/dashboard/listings/$listingId')({
  component: ListingDetailPage,
});

function ListingDetailPage() {
  const { listingId } = Route.useParams();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/dashboard/listings"
          className="text-sm text-primary hover:underline"
        >
          &larr; Back to Listings
        </Link>
      </div>
      <ListingDetail listingId={listingId} />
    </div>
  );
}
