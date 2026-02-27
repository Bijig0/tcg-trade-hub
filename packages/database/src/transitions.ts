/**
 * State transition maps and helpers for all entities with status columns.
 *
 * Three layers of protection:
 * 1. PostgreSQL triggers (safety net at DB level)
 * 2. This module (developer-facing API for UI/mutation guards)
 * 3. Realtime hooks (keep peers in sync)
 */
import type {
  ListingStatus,
  OfferStatus,
  MatchStatus,
  MeetupStatus,
  ReportStatus,
  ShopEventStatus,
} from './types';

// ---------------------------------------------------------------------------
// Transition maps
// ---------------------------------------------------------------------------

export const LISTING_TRANSITIONS = {
  active: ['matched', 'expired'],
  matched: ['completed'],
  completed: [],
  expired: [],
} as const satisfies Record<ListingStatus, readonly ListingStatus[]>;

export const OFFER_TRANSITIONS = {
  pending: ['accepted', 'declined', 'countered', 'withdrawn'],
  countered: ['accepted', 'declined', 'withdrawn'],
  accepted: [],
  declined: [],
  withdrawn: [],
} as const satisfies Record<OfferStatus, readonly OfferStatus[]>;

export const MATCH_TRANSITIONS = {
  active: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
} as const satisfies Record<MatchStatus, readonly MatchStatus[]>;

export const MEETUP_TRANSITIONS = {
  confirmed: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
} as const satisfies Record<MeetupStatus, readonly MeetupStatus[]>;

export const REPORT_TRANSITIONS = {
  pending: ['reviewed'],
  reviewed: ['resolved'],
  resolved: [],
} as const satisfies Record<ReportStatus, readonly ReportStatus[]>;

export const SHOP_EVENT_TRANSITIONS = {
  draft: ['published', 'cancelled'],
  published: ['cancelled', 'completed'],
  cancelled: [],
  completed: [],
} as const satisfies Record<ShopEventStatus, readonly ShopEventStatus[]>;

// ---------------------------------------------------------------------------
// Entity → transition map lookup
// ---------------------------------------------------------------------------

type EntityName = 'listing' | 'offer' | 'match' | 'meetup' | 'report' | 'shop_event';

type StatusForEntity<E extends EntityName> = E extends 'listing'
  ? ListingStatus
  : E extends 'offer'
    ? OfferStatus
    : E extends 'match'
      ? MatchStatus
      : E extends 'meetup'
        ? MeetupStatus
        : E extends 'report'
          ? ReportStatus
          : E extends 'shop_event'
            ? ShopEventStatus
            : never;

const TRANSITION_MAPS: Record<EntityName, Record<string, readonly string[]>> = {
  listing: LISTING_TRANSITIONS,
  offer: OFFER_TRANSITIONS,
  match: MATCH_TRANSITIONS,
  meetup: MEETUP_TRANSITIONS,
  report: REPORT_TRANSITIONS,
  shop_event: SHOP_EVENT_TRANSITIONS,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns true if transitioning from `from` to `to` is valid for the given entity.
 */
export const canTransition = <E extends EntityName>(
  entity: E,
  from: StatusForEntity<E>,
  to: StatusForEntity<E>,
): boolean => {
  const map = TRANSITION_MAPS[entity];
  const allowed = map[from as string];
  if (!allowed) return false;
  return allowed.includes(to as string);
};

/**
 * Returns the list of valid next statuses for the given entity and current status.
 */
export const getValidTransitions = <E extends EntityName>(
  entity: E,
  from: StatusForEntity<E>,
): StatusForEntity<E>[] => {
  const map = TRANSITION_MAPS[entity];
  return (map[from as string] ?? []) as StatusForEntity<E>[];
};

/**
 * Throws if the transition is invalid. Use as a guard before mutations.
 */
export const assertTransition = <E extends EntityName>(
  entity: E,
  from: StatusForEntity<E>,
  to: StatusForEntity<E>,
): void => {
  if (!canTransition(entity, from, to)) {
    const valid = getValidTransitions(entity, from);
    throw new Error(
      `Invalid ${entity} status transition: "${from}" → "${to}". ` +
        (valid.length > 0
          ? `Valid transitions from "${from}": ${valid.join(', ')}.`
          : `"${from}" is a terminal status — no further transitions allowed.`),
    );
  }
};

/**
 * Returns true if the given status is terminal (no further transitions).
 */
export const isTerminalStatus = <E extends EntityName>(
  entity: E,
  status: StatusForEntity<E>,
): boolean => {
  return getValidTransitions(entity, status).length === 0;
};

// ---------------------------------------------------------------------------
// Type guards for actionable statuses
// ---------------------------------------------------------------------------

/**
 * Returns true if the offer can still be acted upon (not terminal).
 */
export const isActionableOffer = (status: OfferStatus): boolean =>
  status === 'pending' || status === 'countered';

/**
 * Returns true if the listing can still receive actions.
 */
export const isActionableListing = (status: ListingStatus): boolean =>
  status === 'active' || status === 'matched';

/**
 * Returns true if the meetup can still be acted upon.
 */
export const isActionableMeetup = (status: MeetupStatus): boolean =>
  status === 'confirmed';

/**
 * Returns true if the shop event can still be modified.
 */
export const isActionableShopEvent = (status: ShopEventStatus): boolean =>
  status === 'draft' || status === 'published';

// ---------------------------------------------------------------------------
// Step index computation (shared with graph-sync and mobile live emitter)
// ---------------------------------------------------------------------------

/**
 * Deterministic step index for a transition within an entity's state machine path.
 * Steps are ordered by source status (insertion order in the map), then by target index.
 *
 * Used by both the graph-sync registry builder and the mobile dev live emitter
 * to compute identical step indexes for the same transition.
 */
export const stateStepIndex = (
  entity: EntityName,
  from: string,
  to: string,
): number => {
  const transitions = TRANSITION_MAPS[entity];
  let idx = 0;
  for (const [status, targets] of Object.entries(transitions)) {
    for (const target of targets) {
      if (status === from && target === to) return idx;
      idx++;
    }
  }
  return idx;
};
