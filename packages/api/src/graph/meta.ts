import type { ProcedureMeta, ExternalEntry } from "flow-graph";

/**
 * Procedure metadata for the TCG Trade Hub graph.
 * Maps router paths to their table/storage connections and consumers.
 */
export const routerMeta: Record<string, Record<string, ProcedureMeta>> = {
  card: {
    search: {
      tables: [],
      consumers: ["web"],
      description: "Search cards across TCG databases (Pokemon, MTG, Yu-Gi-Oh)",
    },
  },
  preRegistration: {
    create: {
      tables: [
        { name: "pre_registrations", operation: "insert" },
        { name: "pre_registrations", operation: "select" },
      ],
      consumers: ["web"],
      description: "Register user for early access to TCG Trade Hub",
    },
  },
};

/**
 * External entries for core trading operations that aren't oRPC procedures yet.
 * These are currently Supabase-direct mutations from the mobile app.
 * When they become oRPC procedures, move them to `routerMeta` above.
 */
export const tradingOperationEntries: ExternalEntry[] = [
  {
    id: "listing.create",
    displayLabel: "listing.create",
    connections: [{ from: "app:mobile", to: "table:listings" }],
    meta: {
      description: "Create a new listing (WTS/WTB/WTT)",
      tables: [{ name: "listings", operation: "insert" }],
      consumers: ["mobile"],
    },
  },
  {
    id: "offer.create",
    displayLabel: "offer.create",
    connections: [
      { from: "app:mobile", to: "table:offers" },
      { from: "app:mobile", to: "table:offer_items" },
    ],
    meta: {
      description: "Send an offer on a listing with card items",
      tables: [
        { name: "offers", operation: "insert" },
        { name: "offer_items", operation: "insert" },
      ],
      consumers: ["mobile"],
    },
  },
  {
    id: "listing.respond",
    displayLabel: "listing.respond",
    connections: [
      { from: "app:mobile", to: "table:offers" },
      { from: "app:mobile", to: "table:listings" },
      { from: "app:mobile", to: "table:matches" },
    ],
    meta: {
      description: "Respond to an offer (accept/decline/counter), update listing and create match",
      tables: [
        { name: "offers", operation: "update" },
        { name: "listings", operation: "update" },
        { name: "matches", operation: "insert" },
      ],
      consumers: ["mobile"],
    },
  },
  {
    id: "meetup.cancel",
    displayLabel: "meetup.cancel",
    connections: [{ from: "app:mobile", to: "table:meetups" }],
    meta: {
      description: "Cancel a confirmed meetup",
      tables: [{ name: "meetups", operation: "update" }],
      consumers: ["mobile"],
    },
  },
  {
    id: "meetup.complete",
    displayLabel: "meetup.complete",
    connections: [
      { from: "app:mobile", to: "table:meetups" },
      { from: "app:mobile", to: "table:matches" },
    ],
    meta: {
      description: "Complete a meetup and finalize the match",
      tables: [
        { name: "meetups", operation: "update" },
        { name: "matches", operation: "update" },
      ],
      consumers: ["mobile"],
    },
  },
];
