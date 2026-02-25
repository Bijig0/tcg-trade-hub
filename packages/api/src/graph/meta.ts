import type { ProcedureMeta } from "flow-graph";

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
