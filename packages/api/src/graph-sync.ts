import { openDb, importFromProcedureMeta } from "flow-graph";
import { routerMeta, tradingOperationEntries } from "./graph/meta";
import {
  stateTransitionEntries,
  stateFlowDefinitions,
} from "./graph/stateTransitions";

const db = openDb();

importFromProcedureMeta(
  db,
  routerMeta,
  [...tradingOperationEntries, ...stateTransitionEntries],
  { flowDefinitions: stateFlowDefinitions },
);

console.log("Graph synced.");
