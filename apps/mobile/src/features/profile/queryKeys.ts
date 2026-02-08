export const profileKeys = {
  all: ['profile'] as const,
  myProfile: () => [...profileKeys.all, 'me'] as const,
  publicProfile: (userId: string) => [...profileKeys.all, 'public', userId] as const,
  ratings: (userId: string) => [...profileKeys.all, 'ratings', userId] as const,
};
