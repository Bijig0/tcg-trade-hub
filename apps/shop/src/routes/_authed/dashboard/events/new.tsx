import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { EventForm } from '@/features/events/components/EventForm';

export const Route = createFileRoute('/_authed/dashboard/events/new')({
  component: NewEventPage,
});

function NewEventPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground">Create Event</h2>
      <EventForm
        onSuccess={() => navigate({ to: '/dashboard/events' })}
      />
    </div>
  );
}
