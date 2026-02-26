import { openDb, importFromProcedureMeta, upsertAnnotation } from "flow-graph";
import { routerMeta, tradingOperationEntries } from "./graph/meta";
import {
  pipelineEntries,
  pipelineFlowDefinitions,
  pipelineAnnotations,
} from "./graph/pipelines";
import {
  stateTransitionEntries,
  stateFlowDefinitions,
} from "./graph/stateTransitions";

const db = openDb();

importFromProcedureMeta(
  db,
  routerMeta,
  [...tradingOperationEntries, ...pipelineEntries, ...stateTransitionEntries],
  {
    flowDefinitions: {
      ...stateFlowDefinitions,
      ...pipelineFlowDefinitions,
    },
  },
);

for (const ann of pipelineAnnotations) {
  upsertAnnotation(db, ann);
}

console.log("Graph synced.");
