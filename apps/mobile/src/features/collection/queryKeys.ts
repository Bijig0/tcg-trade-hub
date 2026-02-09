export const collectionKeys = {
  all: ['collection'] as const,
  myCollection: () => [...collectionKeys.all, 'mine'] as const,
  myWishlist: () => [...collectionKeys.all, 'wishlist'] as const,
  mySealedProducts: () => [...collectionKeys.all, 'sealed'] as const,
  portfolioValue: () => [...collectionKeys.all, 'portfolio-value'] as const,
  cardDetail: (externalId: string) => [...collectionKeys.all, 'card-detail', externalId] as const,
  userCollection: (userId: string) => [...collectionKeys.all, 'user', userId] as const,
};
