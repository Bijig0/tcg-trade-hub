export const collectionKeys = {
  all: ['collection'] as const,
  myCollection: () => [...collectionKeys.all, 'mine'] as const,
  userCollection: (userId: string) => [...collectionKeys.all, 'user', userId] as const,
};
