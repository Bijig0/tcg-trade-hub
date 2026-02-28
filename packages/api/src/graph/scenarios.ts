/**
 * Static scenario configuration.
 *
 * Scenarios describe specific transition paths WITHIN an existing
 * state machine graph path. They are NOT separate graph paths —
 * they are metadata that references step indices in a parent path.
 */

export type ScenarioConfig = {
  /** Unique scenario identifier, e.g. "meetup-confirmed". */
  id: string;
  /** Human-readable label, e.g. "Meetup Confirmed". */
  label: string;
  /** Transition path description, e.g. "proposed → confirmed". */
  description: string;
  /** The state machine path this scenario belongs to. */
  parentPathId: string;
  /** Step indices within the parent path that this scenario traverses. */
  stepIndices: number[];
  /** Relative path to the Maestro test file (from e2e/flows/). */
  testFile: string | null;
};

/**
 * All configured scenarios.
 *
 * Meetup step indices (from stateStepIndex("meetup", from, to)):
 *   proposed → confirmed  = 0
 *   proposed → cancelled  = 1
 *   confirmed → completed = 2
 *   confirmed → cancelled = 3
 */
const SCENARIOS: ScenarioConfig[] = [
  {
    id: "meetup-confirmed",
    label: "Meetup Confirmed",
    description: "proposed → confirmed",
    parentPathId: "state:meetup",
    stepIndices: [0],
    testFile: "meetups/meetup-confirmed.yaml",
  },
  {
    id: "meetup-cancelled-from-proposed",
    label: "Meetup Cancelled (from Proposed)",
    description: "proposed → cancelled",
    parentPathId: "state:meetup",
    stepIndices: [1],
    testFile: "meetups/meetup-cancelled-from-proposed.yaml",
  },
  {
    id: "meetup-completed",
    label: "Meetup Completed",
    description: "proposed → confirmed → completed",
    parentPathId: "state:meetup",
    stepIndices: [0, 2],
    testFile: "meetups/meetup-completed.yaml",
  },
  {
    id: "meetup-cancelled-from-confirmed",
    label: "Meetup Cancelled (from Confirmed)",
    description: "proposed → confirmed → cancelled",
    parentPathId: "state:meetup",
    stepIndices: [0, 3],
    testFile: "meetups/meetup-cancelled-from-confirmed.yaml",
  },
];

/** Get all scenarios, optionally filtered by parent path ID. */
export const getScenarios = (parentPathId?: string): ScenarioConfig[] => {
  if (!parentPathId) return SCENARIOS;
  return SCENARIOS.filter((s) => s.parentPathId === parentPathId);
};
