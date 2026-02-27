/**
 * Maps Expo Router tab segments to graph path IDs.
 *
 * When the user navigates to a tab, we emit a "started" event
 * on the primary pathId for that tab so the graph lights up.
 */

type RoutePathMapping = {
  /** The primary graph pathId to emit events on. */
  pathId: string;
  /** Human-readable label for logging. */
  label: string;
};

/**
 * Lookup from Expo Router tab group segment to graph path mapping.
 * Segments without a natural graph path (e.g. profile) are omitted.
 */
export const ROUTE_PATH_MAP: Record<string, RoutePathMapping> = {
  '(discover)': { pathId: 'flow:p2p-trade', label: 'Discover Feed' },
  '(listings)': { pathId: 'state:listing', label: 'My Listings' },
  '(messages)': { pathId: 'state:offer', label: 'Messages' },
  '(meetups)': { pathId: 'state:meetup', label: 'Meetups' },
};
