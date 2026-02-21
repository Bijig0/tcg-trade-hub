import type { MyListingWithMatch, ListingTab } from '../../schemas';

export type GroupedListings = {
  groups: Record<ListingTab, MyListingWithMatch[]>;
  counts: Record<ListingTab, number>;
};

/**
 * Splits an array of enriched listings into tab groups by status.
 *
 * - `active`: status === 'active'
 * - `matched`: status === 'matched'
 * - `history`: status === 'completed' or 'expired'
 */
const groupListingsByTab = (listings: MyListingWithMatch[]): GroupedListings => {
  const groups: Record<ListingTab, MyListingWithMatch[]> = {
    active: [],
    matched: [],
    history: [],
  };

  for (const listing of listings) {
    switch (listing.status) {
      case 'active':
        groups.active.push(listing);
        break;
      case 'matched':
        groups.matched.push(listing);
        break;
      case 'completed':
      case 'expired':
        groups.history.push(listing);
        break;
    }
  }

  return {
    groups,
    counts: {
      active: groups.active.length,
      matched: groups.matched.length,
      history: groups.history.length,
    },
  };
};

export default groupListingsByTab;
