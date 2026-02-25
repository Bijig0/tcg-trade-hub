import type { ExternalEntry, FlowDefinition } from "flow-graph";
import {
  LISTING_TRANSITIONS,
  OFFER_TRANSITIONS,
  MATCH_TRANSITIONS,
  MEETUP_TRANSITIONS,
  REPORT_TRANSITIONS,
} from "@tcg-trade-hub/database";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type TransitionMap = Record<string, readonly string[]>;

interface EntityConfig {
  name: string;
  transitions: TransitionMap;
  table: string;
}

// ---------------------------------------------------------------------------
// Entity configs
// ---------------------------------------------------------------------------

const ENTITIES: EntityConfig[] = [
  { name: "listing", transitions: LISTING_TRANSITIONS, table: "listings" },
  { name: "offer", transitions: OFFER_TRANSITIONS, table: "offers" },
  { name: "match", transitions: MATCH_TRANSITIONS, table: "matches" },
  { name: "meetup", transitions: MEETUP_TRANSITIONS, table: "meetups" },
  { name: "report", transitions: REPORT_TRANSITIONS, table: "reports" },
];

// ---------------------------------------------------------------------------
// Build ExternalEntries from transition maps
// ---------------------------------------------------------------------------

const buildTransitionEntries = (entity: EntityConfig): ExternalEntry[] => {
  const entries: ExternalEntry[] = [];

  for (const [from, targets] of Object.entries(entity.transitions)) {
    for (const to of targets) {
      const id = `ext-op:${entity.name}-${from}-to-${to}`;
      entries.push({
        id,
        displayLabel: `${entity.name}: ${from} → ${to}`,
        connections: [
          { from: `ext:${entity.name}:${from}`, to: `ext:${entity.name}:${to}` },
        ],
        meta: {
          description: `Transition ${entity.name} from "${from}" to "${to}"`,
          tables: [{ name: entity.table, operation: "update" }],
          paths: [
            {
              flow: `state:${entity.name}`,
              step: stepIndex(entity.transitions, from, to),
              label: `${from} → ${to}`,
              connectionFilter: [
                { from: `ext:${entity.name}:${from}`, to: `ext:${entity.name}:${to}` },
              ],
            },
          ],
        },
      });
    }
  }

  return entries;
};

/**
 * Deterministic step index for a transition within an entity's state machine path.
 * Steps are ordered by source status (insertion order in the map), then by target index.
 */
const stepIndex = (
  transitions: TransitionMap,
  from: string,
  to: string,
): number => {
  let idx = 0;
  for (const [status, targets] of Object.entries(transitions)) {
    for (const target of targets) {
      if (status === from && target === to) return idx;
      idx++;
    }
  }
  return idx;
};

// ---------------------------------------------------------------------------
// Build flow definitions
// ---------------------------------------------------------------------------

const buildEntityFlowDef = (entity: EntityConfig): FlowDefinition => ({
  label: `${capitalize(entity.name)} State Machine`,
  description: `All valid status transitions for the ${entity.name} entity`,
});

const capitalize = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

// ---------------------------------------------------------------------------
// P2P Trade Flow — end-to-end path across entities
// ---------------------------------------------------------------------------

const P2P_TRADE_FLOW_ENTRIES: ExternalEntry[] = [
  {
    id: "ext-op:flow-listing-create",
    displayLabel: "Create Listing",
    connections: [{ from: "app:mobile", to: "table:listings" }],
    meta: {
      description: "Seller creates a new listing",
      tables: [{ name: "listings", operation: "insert" }],
      consumers: ["mobile"],
      paths: [
        {
          flow: "flow:p2p-trade",
          step: 0,
          label: "Create Listing",
          connectionFilter: [{ from: "app:mobile", to: "table:listings" }],
        },
      ],
    },
  },
  {
    id: "ext-op:flow-offer-create",
    displayLabel: "Send Offer",
    connections: [
      { from: "app:mobile", to: "table:offers" },
      { from: "app:mobile", to: "table:offer_items" },
    ],
    meta: {
      description: "Buyer sends an offer on a listing",
      tables: [
        { name: "offers", operation: "insert" },
        { name: "offer_items", operation: "insert" },
      ],
      consumers: ["mobile"],
      paths: [
        {
          flow: "flow:p2p-trade",
          step: 1,
          label: "Send Offer",
          connectionFilter: [{ from: "app:mobile", to: "table:offers" }],
        },
      ],
    },
  },
  {
    id: "ext-op:flow-offer-accept",
    displayLabel: "Accept Offer",
    connections: [
      { from: "ext:offer:pending", to: "ext:offer:accepted" },
      { from: "table:offers", to: "table:matches" },
    ],
    meta: {
      description: "Seller accepts the offer, creating a match",
      tables: [
        { name: "offers", operation: "update" },
        { name: "matches", operation: "insert" },
        { name: "listings", operation: "update" },
      ],
      paths: [
        {
          flow: "flow:p2p-trade",
          step: 2,
          label: "Accept Offer",
          connectionFilter: [
            { from: "ext:offer:pending", to: "ext:offer:accepted" },
          ],
        },
      ],
    },
  },
  {
    id: "ext-op:flow-listing-matched",
    displayLabel: "Listing Matched",
    connections: [
      { from: "ext:listing:active", to: "ext:listing:matched" },
    ],
    meta: {
      description: "Listing transitions to matched status",
      tables: [{ name: "listings", operation: "update" }],
      paths: [
        {
          flow: "flow:p2p-trade",
          step: 3,
          label: "Listing Matched",
          connectionFilter: [
            { from: "ext:listing:active", to: "ext:listing:matched" },
          ],
        },
      ],
    },
  },
  {
    id: "ext-op:flow-meetup-confirm",
    displayLabel: "Confirm Meetup",
    connections: [
      { from: "table:matches", to: "table:meetups" },
    ],
    meta: {
      description: "Traders agree on a meetup location and time",
      tables: [{ name: "meetups", operation: "insert" }],
      paths: [
        {
          flow: "flow:p2p-trade",
          step: 4,
          label: "Confirm Meetup",
          connectionFilter: [
            { from: "table:matches", to: "table:meetups" },
          ],
        },
      ],
    },
  },
  {
    id: "ext-op:flow-meetup-complete",
    displayLabel: "Complete Meetup",
    connections: [
      { from: "ext:meetup:confirmed", to: "ext:meetup:completed" },
    ],
    meta: {
      description: "Both traders confirm the trade happened",
      tables: [{ name: "meetups", operation: "update" }],
      paths: [
        {
          flow: "flow:p2p-trade",
          step: 5,
          label: "Complete Meetup",
          connectionFilter: [
            { from: "ext:meetup:confirmed", to: "ext:meetup:completed" },
          ],
        },
      ],
    },
  },
  {
    id: "ext-op:flow-match-complete",
    displayLabel: "Complete Match",
    connections: [
      { from: "ext:match:active", to: "ext:match:completed" },
    ],
    meta: {
      description: "Match transitions to completed after successful meetup",
      tables: [{ name: "matches", operation: "update" }],
      paths: [
        {
          flow: "flow:p2p-trade",
          step: 6,
          label: "Complete Match",
          connectionFilter: [
            { from: "ext:match:active", to: "ext:match:completed" },
          ],
        },
      ],
    },
  },
  {
    id: "ext-op:flow-listing-complete",
    displayLabel: "Complete Listing",
    connections: [
      { from: "ext:listing:matched", to: "ext:listing:completed" },
    ],
    meta: {
      description: "Listing transitions to completed after trade",
      tables: [{ name: "listings", operation: "update" }],
      paths: [
        {
          flow: "flow:p2p-trade",
          step: 7,
          label: "Complete Listing",
          connectionFilter: [
            { from: "ext:listing:matched", to: "ext:listing:completed" },
          ],
        },
      ],
    },
  },
];

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

/** All ExternalEntry[] for state transitions + P2P trade flow operations. */
export const stateTransitionEntries: ExternalEntry[] = [
  ...ENTITIES.flatMap(buildTransitionEntries),
  ...P2P_TRADE_FLOW_ENTRIES,
];

/** Flow definitions for each entity state machine + the P2P trade flow. */
export const stateFlowDefinitions: Record<string, FlowDefinition> = {
  ...Object.fromEntries(
    ENTITIES.map((e) => [`state:${e.name}`, buildEntityFlowDef(e)]),
  ),
  "flow:p2p-trade": {
    label: "P2P Trade Flow",
    description:
      "End-to-end flow: listing → offer → match → meetup → completion",
  },
};
