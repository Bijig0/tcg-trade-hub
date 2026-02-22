export const listingKeys = {
  all: ['listings'] as const,
  lists: () => [...listingKeys.all, 'list'] as const,
  myListings: () => [...listingKeys.all, 'my'] as const,
  details: () => [...listingKeys.all, 'detail'] as const,
  detail: (id: string) => [...listingKeys.all, 'detail', id] as const,
  relevantListings: (id: string) => [...listingKeys.all, 'relevant', id] as const,
};
