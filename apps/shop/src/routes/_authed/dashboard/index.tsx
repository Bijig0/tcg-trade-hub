import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/orpc';
import { collectionKeys } from '@/features/collection/queryKeys';
import { listingKeys } from '@/features/listings/queryKeys';

export const Route = createFileRoute('/_authed/dashboard/')({
  component: DashboardHome,
});

function DashboardHome() {
  const { data: shopData } = useQuery({
    queryKey: ['shop', 'mine'],
    queryFn: () => client.shop.get(),
  });

  const shopId = shopData?.shop?.id;

  const { data: eventsData } = useQuery({
    queryKey: ['shop', 'events', shopId],
    queryFn: () => client.shop.events.list({ shop_id: shopId! }),
    enabled: !!shopId,
  });

  const { data: notifData } = useQuery({
    queryKey: ['shop', 'notifications', shopId],
    queryFn: () => client.shop.notifications.list({ shop_id: shopId!, limit: 5 }),
    enabled: !!shopId,
  });

  const { data: portfolioData } = useQuery({
    queryKey: collectionKeys.summary(),
    queryFn: () => client.collection.portfolioSummary(),
  });

  const { data: activeListingsData } = useQuery({
    queryKey: listingKeys.list({ status: 'active' }),
    queryFn: () => client.listing.myList({ status: 'active', limit: 1, offset: 0 }),
  });

  const upcomingEvents = eventsData?.events?.filter(
    (e) => e.status === 'published' && new Date(e.starts_at) > new Date(),
  ) ?? [];

  const unreadNotifs = notifData?.notifications?.filter((n) => !n.read) ?? [];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground">Dashboard</h2>

      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="text-sm text-muted-foreground">Collection</div>
          <div className="mt-1 text-2xl font-bold text-foreground">
            {portfolioData?.total_items ?? 0}
          </div>
          <Link to="/dashboard/collection" className="mt-1 text-xs text-primary hover:underline">
            View all
          </Link>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="text-sm text-muted-foreground">Portfolio Value</div>
          <div className="mt-1 text-2xl font-bold text-foreground">
            ${(portfolioData?.total_value ?? 0).toFixed(2)}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="text-sm text-muted-foreground">Active Listings</div>
          <div className="mt-1 text-2xl font-bold text-foreground">
            {activeListingsData?.total ?? 0}
          </div>
          <Link to="/dashboard/listings" className="mt-1 text-xs text-primary hover:underline">
            View all
          </Link>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="text-sm text-muted-foreground">Upcoming Events</div>
          <div className="mt-1 text-2xl font-bold text-foreground">
            {upcomingEvents.length}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="text-sm text-muted-foreground">Unread Notifications</div>
          <div className="mt-1 text-2xl font-bold text-foreground">
            {unreadNotifs.length}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="text-sm text-muted-foreground">Status</div>
          <div className="mt-1 text-2xl font-bold text-success">
            {shopData?.shop?.verified ? 'Verified' : 'Pending'}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Upcoming Events</h3>
            <Link
              to="/dashboard/events"
              className="text-sm text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          {upcomingEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No upcoming events.</p>
          ) : (
            <ul className="space-y-2">
              {upcomingEvents.slice(0, 3).map((event) => (
                <li
                  key={event.id}
                  className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2"
                >
                  <span className="text-sm font-medium text-foreground">
                    {event.title}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(event.starts_at).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Recent Notifications</h3>
            <Link
              to="/dashboard/notifications"
              className="text-sm text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          {unreadNotifs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No new notifications.</p>
          ) : (
            <ul className="space-y-2">
              {unreadNotifs.slice(0, 3).map((notif) => (
                <li
                  key={notif.id}
                  className="rounded-lg bg-secondary/50 px-3 py-2"
                >
                  <div className="text-sm font-medium text-foreground">
                    {notif.title}
                  </div>
                  {notif.body && (
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {notif.body}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
