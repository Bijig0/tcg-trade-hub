import { createFileRoute, Link } from '@tanstack/react-router';
import { EventList } from '@/features/events/components/EventList';

export const Route = createFileRoute('/_authed/dashboard/events/')({
  component: EventsPage,
});

function EventsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Events</h2>
        <Link
          to="/dashboard/events/new"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Create Event
        </Link>
      </div>
      <EventList />
    </div>
  );
}
