import type { ExternalEntry, FlowDefinition } from "flow-graph";
import { pipelineRegistry } from "../pipelines/registry";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type StepDef = {
  label: string;
  table: string;
  operation: "insert" | "update" | "upsert" | "delete" | "rpc";
};

type PipelineGraphConfig = {
  name: string;
  rpcFunction: string;
  description: string;
  preChecks: string[];
  steps: StepDef[];
};

type AnnotationRecord = {
  targetType: "node" | "edge";
  targetId: string;
  field: string;
  value: string;
};

// ---------------------------------------------------------------------------
// Pipeline step definitions (source of truth for graph visualization)
//
// Derived from supabase/migrations/00013_pipeline_rpc_functions.sql.
// Each step maps to a table operation performed inside the RPC transaction.
// ---------------------------------------------------------------------------

const PIPELINE_CONFIGS: PipelineGraphConfig[] = [
  {
    name: "acceptOffer",
    rpcFunction: pipelineRegistry.acceptOffer.rpc.functionName,
    description: pipelineRegistry.acceptOffer.description,
    preChecks: pipelineRegistry.acceptOffer.preChecks.map((c) => c.name),
    steps: [
      { label: "Accept Offer", table: "offers", operation: "update" },
      { label: "Decline Sibling Offers", table: "offers", operation: "update" },
      { label: "Create Match", table: "matches", operation: "insert" },
      { label: "Listing → Matched", table: "listings", operation: "update" },
      { label: "Create Conversation", table: "conversations", operation: "insert" },
      { label: "System Message", table: "messages", operation: "insert" },
    ],
  },
  {
    name: "declineOffer",
    rpcFunction: pipelineRegistry.declineOffer.rpc.functionName,
    description: pipelineRegistry.declineOffer.description,
    preChecks: pipelineRegistry.declineOffer.preChecks.map((c) => c.name),
    steps: [
      { label: "Decline Offer", table: "offers", operation: "update" },
    ],
  },
  {
    name: "completeMeetup",
    rpcFunction: pipelineRegistry.completeMeetup.rpc.functionName,
    description: pipelineRegistry.completeMeetup.description,
    preChecks: pipelineRegistry.completeMeetup.preChecks.map((c) => c.name),
    steps: [
      { label: "Set Completion Flag", table: "meetups", operation: "update" },
      { label: "Meetup → Completed", table: "meetups", operation: "update" },
      { label: "Match → Completed", table: "matches", operation: "update" },
      { label: "Increment Total Trades", table: "users", operation: "update" },
    ],
  },
  {
    name: "expireListing",
    rpcFunction: pipelineRegistry.expireListing.rpc.functionName,
    description: pipelineRegistry.expireListing.description,
    preChecks: pipelineRegistry.expireListing.preChecks.map((c) => c.name),
    steps: [
      { label: "Listing → Expired", table: "listings", operation: "update" },
      { label: "Withdraw Pending Offers", table: "offers", operation: "update" },
    ],
  },
  {
    name: "createOffer",
    rpcFunction: pipelineRegistry.createOffer.rpc.functionName,
    description: pipelineRegistry.createOffer.description,
    preChecks: pipelineRegistry.createOffer.preChecks.map((c) => c.name),
    steps: [
      { label: "Insert Offer", table: "offers", operation: "insert" },
      { label: "Insert Offer Items", table: "offer_items", operation: "insert" },
    ],
  },
];

// ---------------------------------------------------------------------------
// Build ExternalEntries
// ---------------------------------------------------------------------------

const capitalize = (s: string): string =>
  s.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());

const buildPipelineEntries = (config: PipelineGraphConfig): ExternalEntry[] => {
  const flowId = `pipeline:${config.name}`;
  const rpcNodeId = `rpc:${config.rpcFunction}`;
  const entries: ExternalEntry[] = [];

  // Entry-point: app:mobile → rpc:<fn>
  entries.push({
    id: `pipeline:${config.name}`,
    displayLabel: capitalize(config.name),
    connections: [{ from: "app:mobile", to: rpcNodeId }],
    meta: {
      description: config.description,
      consumers: ["mobile"],
      paths: [
        {
          flow: flowId,
          step: 0,
          label: `Invoke ${capitalize(config.name)}`,
          connectionFilter: [{ from: "app:mobile", to: rpcNodeId }],
        },
      ],
    },
  });

  // Step entries: rpc:<fn> → table:<name>
  for (let i = 0; i < config.steps.length; i++) {
    const step = config.steps[i];
    entries.push({
      id: `pipeline:${config.name}:step-${i}`,
      displayLabel: step.label,
      connections: [{ from: rpcNodeId, to: `table:${step.table}` }],
      meta: {
        description: `${config.name}: ${step.label}`,
        tables: [{ name: step.table, operation: step.operation }],
        paths: [
          {
            flow: flowId,
            step: i + 1,
            label: step.label,
            connectionFilter: [{ from: rpcNodeId, to: `table:${step.table}` }],
          },
        ],
      },
    });
  }

  return entries;
};

// ---------------------------------------------------------------------------
// Build FlowDefinitions
// ---------------------------------------------------------------------------

const buildFlowDefinitions = (): Record<string, FlowDefinition> => {
  const defs: Record<string, FlowDefinition> = {};
  for (const config of PIPELINE_CONFIGS) {
    defs[`pipeline:${config.name}`] = {
      label: `Pipeline: ${capitalize(config.name)}`,
      description: config.description,
    };
  }
  return defs;
};

// ---------------------------------------------------------------------------
// Build Annotations
// ---------------------------------------------------------------------------

const buildAnnotations = (): AnnotationRecord[] => {
  const annotations: AnnotationRecord[] = [];
  for (const config of PIPELINE_CONFIGS) {
    const targetId = `pipeline:${config.name}`;
    annotations.push(
      {
        targetType: "node",
        targetId,
        field: "rpcFunction",
        value: config.rpcFunction,
      },
      {
        targetType: "node",
        targetId,
        field: "preChecks",
        value: config.preChecks.join(", "),
      },
      {
        targetType: "node",
        targetId,
        field: "atomicity",
        value: "Single Postgres transaction with FOR UPDATE row locking",
      },
      {
        targetType: "node",
        targetId,
        field: "source",
        value: "pipeline-registry",
      },
    );
  }
  return annotations;
};

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

/** All ExternalEntry[] for pipeline operations. */
export const pipelineEntries: ExternalEntry[] =
  PIPELINE_CONFIGS.flatMap(buildPipelineEntries);

/** Flow definitions for each pipeline. */
export const pipelineFlowDefinitions: Record<string, FlowDefinition> =
  buildFlowDefinitions();

/** Annotation records to store on pipeline nodes. */
export const pipelineAnnotations: AnnotationRecord[] = buildAnnotations();
