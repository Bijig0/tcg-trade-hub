import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from '@/lib/orpc';

export const NotificationFeed = () => {
  const queryClient = useQueryClient();

  const { data: shopData } = useQuery({
    queryKey: ['shop', 'mine'],
    queryFn: () => client.shop.get(),
  });

  const shopId = shopData?.shop?.id;

  const { data, isLoading } = useQuery({
    queryKey: ['shop', 'notifications', shopId],
    queryFn: () => client.shop.notifications.list({ shop_id: shopId!, limit: 50 }),
    enabled: !!shopId,
  });

  const markReadMutation = useMutation({
    mutationFn: (ids: string[]) => client.shop.notifications.markRead({ ids }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop', 'notifications'] });
    },
  });

  const notifications = data?.notifications ?? [];
  const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {unreadIds.length > 0 && (
        <button
          type="button"
          onClick={() => markReadMutation.mutate(unreadIds)}
          disabled={markReadMutation.isPending}
          className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Mark all as read ({unreadIds.length})
        </button>
      )}

      {notifications.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`rounded-xl border p-4 ${
                notif.read
                  ? 'border-border bg-card'
                  : 'border-primary/20 bg-primary/5'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-medium text-foreground">{notif.title}</div>
                  {notif.body && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {notif.body}
                    </p>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(notif.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="rounded bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                  {notif.type}
                </span>
                {!notif.read && (
                  <span className="h-2 w-2 rounded-full bg-primary" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
