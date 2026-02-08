export const meetupKeys = {
  all: ['meetups'] as const,
  upcoming: () => [...meetupKeys.all, 'upcoming'] as const,
  past: () => [...meetupKeys.all, 'past'] as const,
  detail: (id: string) => [...meetupKeys.all, 'detail', id] as const,
};
