import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { AddCardForm } from '@/features/collection/components/AddCardForm/AddCardForm';

export const Route = createFileRoute('/_authed/dashboard/collection/add')({
  component: AddCardPage,
});

function AddCardPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground">Add Card</h2>
      <AddCardForm
        onSuccess={() => navigate({ to: '/dashboard/collection' })}
      />
    </div>
  );
}
