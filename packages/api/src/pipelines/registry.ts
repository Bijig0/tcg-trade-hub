import acceptOffer from './acceptOffer/acceptOffer';
import declineOffer from './declineOffer/declineOffer';
import completeMeetup from './completeMeetup/completeMeetup';
import expireListing from './expireListing/expireListing';
import createOffer from './createOffer/createOffer';
import sendMessage from './sendMessage/sendMessage';

/**
 * The pipeline registry: the single source of truth for all state-changing
 * workflows in TCG Trade Hub.
 *
 * Each pipeline documents:
 * - What inputs it accepts (Zod schema)
 * - What pre-checks run before the mutation
 * - Which Postgres RPC function performs the atomic write
 * - What post-commit effects fire afterward
 *
 * Open this file to see every workflow at a glance.
 */
export const pipelineRegistry = {
  acceptOffer,
  declineOffer,
  completeMeetup,
  expireListing,
  createOffer,
  sendMessage,
} as const;

export type PipelineName = keyof typeof pipelineRegistry;
