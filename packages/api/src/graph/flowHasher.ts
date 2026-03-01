/**
 * Content-based hashing for Maestro flow YAML files.
 *
 * Uses SHA-256 on raw file bytes so the hash is deterministic
 * regardless of mtime or git checkout order.
 *
 * V1: Only hashes the top-level flow file. Subflow changes
 * (e.g., _subflows/login.yaml) won't invalidate parent flows.
 * Users can force re-run via "Run All" to bypass cache.
 * TODO(v2): Recursive subflow hashing via `runFlow` directive parsing.
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

/** SHA-256 of file contents, returned as hex string. */
const hashFlowFile = (filePath: string): string => {
  const data = readFileSync(filePath);
  return createHash("sha256").update(data).digest("hex");
};

export { hashFlowFile };
