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
 * External entries for operations not yet covered by the pipeline registry.
 * Most trading operations are now defined in ./pipelines.ts as pipeline-derived entries.
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
    id: "meetup.cancel",
    displayLabel: "meetup.cancel",
    connections: [{ from: "app:mobile", to: "table:meetups" }],
    meta: {
      description: "Cancel a confirmed meetup",
      tables: [{ name: "meetups", operation: "update" }],
      consumers: ["mobile"],
    },
  },
];
