import { createFileRoute } from '@tanstack/react-router';
import { NotificationFeed } from '@/features/notifications/components/NotificationFeed';

export const Route = createFileRoute('/_authed/dashboard/notifications')({
  component: NotificationsPage,
});

function NotificationsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground">Notifications</h2>
      <NotificationFeed />
    </div>
  );
}
