export const eventKeys = {
  all: ['shop', 'events'] as const,
  list: (shopId: string) => [...eventKeys.all, shopId] as const,
  detail: (eventId: string) => [...eventKeys.all, 'detail', eventId] as const,
};
