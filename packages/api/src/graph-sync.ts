import { openDb, importFromProcedureMeta } from "flow-graph";
import { routerMeta } from "./graph/meta";

const db = openDb();

importFromProcedureMeta(db, routerMeta, [], {
  flowDefinitions: {}, // add flows later as the project grows
});

console.log("Graph synced.");
