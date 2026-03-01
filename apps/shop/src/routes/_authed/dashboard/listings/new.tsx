import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { CreateListingForm } from '@/features/listings/components/CreateListingForm/CreateListingForm';

export const Route = createFileRoute('/_authed/dashboard/listings/new')({
  component: NewListingPage,
});

function NewListingPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground">Create Listing</h2>
      <CreateListingForm
        onSuccess={() => navigate({ to: '/dashboard/listings' })}
      />
    </div>
  );
}
