import { Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/orpc';

export const NotificationBell = () => {
  const { data: shopData } = useQuery({
    queryKey: ['shop', 'mine'],
    queryFn: () => client.shop.get(),
  });

  const shopId = shopData?.shop?.id;

  const { data: notifData } = useQuery({
    queryKey: ['shop', 'notifications', shopId, 'unread-count'],
    queryFn: () => client.shop.notifications.list({ shop_id: shopId!, limit: 100 }),
    enabled: !!shopId,
    select: (data) => data.notifications.filter((n) => !n.read).length,
  });

  const unreadCount = notifData ?? 0;

  return (
    <Link
      to="/dashboard/notifications"
      className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
    >
      <span className="text-xl">{'\u{1F514}'}</span>
      {unreadCount > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Link>
  );
};
