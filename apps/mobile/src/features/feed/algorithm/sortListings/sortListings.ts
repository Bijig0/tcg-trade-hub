import type { ListingWithDistance } from '../../schemas';
import type { FeedSort } from '../../schemas';

/**
 * Sorts listings by the given sort option.
 *
 * Returns a new array — does not mutate the input.
 * `relevance` is a no-op (ranking is handled separately by rankListings).
 */
const sortListings = (
  listings: ListingWithDistance[],
  sort: FeedSort,
): ListingWithDistance[] => {
  switch (sort) {
    case 'newest':
      return [...listings].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
    case 'price':
      return [...listings].sort((a, b) => a.total_value - b.total_value);
    case 'distance':
      return [...listings].sort((a, b) => a.distance_km - b.distance_km);
    case 'relevance':
    default:
      return listings;
  }
};

export default sortListings;
