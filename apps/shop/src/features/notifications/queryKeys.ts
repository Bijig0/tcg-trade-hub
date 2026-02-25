export const notificationKeys = {
  all: ['shop', 'notifications'] as const,
  list: (shopId: string) => [...notificationKeys.all, shopId] as const,
  unreadCount: (shopId: string) => [...notificationKeys.all, shopId, 'unread-count'] as const,
};
