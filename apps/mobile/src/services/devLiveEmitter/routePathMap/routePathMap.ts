/**
 * Maps Expo Router segments to graph path IDs with step-level granularity.
 *
 * When the user navigates within the app, we resolve the full segment path
 * to a graph pathId + stepIndex so the admin graph can highlight the
 * exact step the user is on.
 */

type RoutePathMapping = {
  /** The graph pathId to emit events on. */
  pathId: string;
  /** Human-readable label for logging / display. */
  label: string;
  /** Step index within the path (0 = the "enter this tab" step). */
  stepIndex: number;
};

/**
 * Lookup from full segment path to graph path mapping.
 *
 * Keys use "/" to join segments after "(tabs)".
 * The resolver tries longest-prefix match first, then falls back to tab-only.
 *
 * Example segments from Expo Router:
 *   ['(tabs)', '(discover)']                     -> key: '(discover)'
 *   ['(tabs)', '(discover)', 'browse']           -> key: '(discover)/browse'
 *   ['(tabs)', '(listings)', 'listing', '[id]']  -> key: '(listings)/listing/[id]'
 */
const ROUTE_PATH_MAP: Record<string, RoutePathMapping> = {
  // ── P2P Trade Flow (flow:p2p-trade) ──
  '(discover)':              { pathId: 'flow:p2p-trade', label: 'Discover Feed',   stepIndex: 0 },
  '(discover)/browse':       { pathId: 'flow:p2p-trade', label: 'Browse Listings', stepIndex: 0 },

  // ── Listing State Machine (state:listing) ──
  '(listings)':              { pathId: 'state:listing',  label: 'My Listings',     stepIndex: 0 },
  '(listings)/new':          { pathId: 'state:listing',  label: 'New Listing',     stepIndex: 0 },
  '(listings)/add-card':     { pathId: 'state:listing',  label: 'Add Card',        stepIndex: 0 },
  '(listings)/add-sealed':   { pathId: 'state:listing',  label: 'Add Sealed',      stepIndex: 0 },
  '(listings)/listing/[id]': { pathId: 'state:listing',  label: 'Listing Detail',  stepIndex: 1 },
  '(listings)/edit/[id]':    { pathId: 'state:listing',  label: 'Edit Listing',    stepIndex: 2 },
  '(listings)/trade-builder': { pathId: 'flow:p2p-trade', label: 'Trade Builder',  stepIndex: 1 },

  // ── Offer State Machine (state:offer) ──
  '(messages)':                       { pathId: 'state:offer',  label: 'Messages',        stepIndex: 0 },
  '(messages)/chat/[conversationId]': { pathId: 'state:offer',  label: 'Chat Thread',     stepIndex: 1 },
  '(messages)/offer-detail':          { pathId: 'state:offer',  label: 'Offer Detail',    stepIndex: 2 },
  '(messages)/meetup-location':       { pathId: 'state:meetup', label: 'Meetup Location', stepIndex: 1 },

  // ── Meetup State Machine (state:meetup) ──
  '(meetups)':       { pathId: 'state:meetup', label: 'Meetups',       stepIndex: 0 },
  '(meetups)/[id]':  { pathId: 'state:meetup', label: 'Meetup Detail', stepIndex: 1 },

  // Profile screens intentionally omitted — no corresponding graph flow.
};

/** Check if a segment looks like a dynamic value (UUID, number, etc.) */
const isDynamicSegment = (seg: string): boolean =>
  // UUID pattern (hex + dashes, 8+ chars)
  /^[0-9a-f-]{8,}$/i.test(seg) ||
  // Pure number
  /^\d+$/.test(seg) ||
  // UUID-like with standard 8-4-4-4-12 structure
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(seg);

/**
 * For dynamic segments, guess the param name based on the preceding route segment.
 * Falls back to 'id' which covers most cases.
 */
const guessDynamicName = (segments: string[], index: number): string => {
  const prev = segments[index - 1];
  if (prev === 'chat') return 'conversationId';
  return 'id';
};

/**
 * Resolves Expo Router segments to the best-matching path mapping.
 * Tries longest prefix first, then falls back to tab-only segment.
 *
 * Dynamic segments like "abc-123-uuid" are matched against "[id]" patterns.
 */
const resolveSegments = (
  segments: string[],
): RoutePathMapping | null => {
  // segments = ['(tabs)', '(discover)', 'browse'] or similar
  const afterTabs = segments.slice(1); // drop '(tabs)'
  if (afterTabs.length === 0) return null;

  // Try longest match first, progressively shorten
  for (let len = afterTabs.length; len >= 1; len--) {
    const key = afterTabs
      .slice(0, len)
      .map((seg, i) =>
        isDynamicSegment(seg) ? `[${guessDynamicName(afterTabs, i)}]` : seg,
      )
      .join('/');
    const mapping = ROUTE_PATH_MAP[key];
    if (mapping) return mapping;
  }

  return null;
};

export { ROUTE_PATH_MAP, resolveSegments };
export type { RoutePathMapping };
