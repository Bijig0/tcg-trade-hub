export const listingKeys = {
  all: ['listings'] as const,
  lists: () => [...listingKeys.all, 'list'] as const,
  myListings: () => [...listingKeys.all, 'my'] as const,
  details: () => [...listingKeys.all, 'detail'] as const,
  detail: (id: string) => [...listingKeys.all, 'detail', id] as const,
  offers: (listingId: string) => [...listingKeys.all, 'offers', listingId] as const,
  offerDetail: (id: string) => [...listingKeys.all, 'offer-detail', id] as const,
};
