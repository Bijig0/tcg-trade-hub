/**
 * Maps Expo Router segments to graph path IDs with step-level granularity.
 *
 * When the user navigates within the app, we resolve the full segment path
 * to one or more graph pathId + stepIndex pairs so the admin graph can
 * highlight every flow the user is currently participating in.
 */

/** A single flow that a route participates in. */
type RouteFlowEntry = {
  /** The graph pathId to emit events on. */
  pathId: string;
  /** Step index within the path (0 = the "enter this tab" step). */
  stepIndex: number;
};

type RoutePathMapping = {
  /** Human-readable label for logging / display. */
  label: string;
  /** One or more flows this route participates in. */
  flows: RouteFlowEntry[];
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
  '(discover)':              { label: 'Discover Feed',   flows: [{ pathId: 'flow:p2p-trade', stepIndex: 0 }] },
  '(discover)/browse':       { label: 'Browse Listings', flows: [{ pathId: 'flow:p2p-trade', stepIndex: 0 }] },

  // ── Listing State Machine (state:listing) ──
  '(listings)':              { label: 'My Listings',     flows: [{ pathId: 'state:listing', stepIndex: 0 }] },
  '(listings)/new':          { label: 'New Listing',     flows: [{ pathId: 'state:listing', stepIndex: 0 }] },
  '(listings)/add-card':     { label: 'Add Card',        flows: [{ pathId: 'state:listing', stepIndex: 0 }] },
  '(listings)/add-sealed':   { label: 'Add Sealed',      flows: [{ pathId: 'state:listing', stepIndex: 0 }] },
  '(listings)/listing/[id]': { label: 'Listing Detail',  flows: [{ pathId: 'state:listing', stepIndex: 1 }] },
  '(listings)/edit/[id]':    { label: 'Edit Listing',    flows: [{ pathId: 'state:listing', stepIndex: 2 }] },

  // ── Multi-flow routes ──
  '(listings)/trade-builder': {
    label: 'Trade Builder',
    flows: [
      { pathId: 'flow:p2p-trade', stepIndex: 1 },
      { pathId: 'state:listing', stepIndex: 1 },
    ],
  },

  // ── Offer State Machine (state:offer) ──
  '(messages)':              { label: 'Messages',      flows: [{ pathId: 'state:offer', stepIndex: 0 }] },
  '(messages)/offer-detail': { label: 'Offer Detail',  flows: [{ pathId: 'state:offer', stepIndex: 2 }] },

  '(messages)/chat/[conversationId]': {
    label: 'Chat Thread',
    flows: [
      { pathId: 'state:offer', stepIndex: 1 },
      { pathId: 'flow:p2p-trade', stepIndex: 2 },
    ],
  },

  '(messages)/meetup-location': {
    label: 'Meetup Location',
    flows: [
      { pathId: 'state:meetup', stepIndex: 1 },
      { pathId: 'state:offer', stepIndex: 2 },
    ],
  },

  // ── Meetup State Machine (state:meetup) ──
  '(meetups)':       { label: 'Meetups',       flows: [{ pathId: 'state:meetup', stepIndex: 0 }] },
  '(meetups)/[id]':  { label: 'Meetup Detail', flows: [{ pathId: 'state:meetup', stepIndex: 1 }] },

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
export type { RoutePathMapping, RouteFlowEntry };
