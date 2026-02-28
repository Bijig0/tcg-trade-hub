import type { z } from 'zod';
import type { ListingTypeSchema } from '@tcg-trade-hub/database';

type ListingType = z.infer<typeof ListingTypeSchema>;

type DeriveListingTypeParams = {
  hasCards: boolean;
  acceptsCash: boolean;
  acceptsTrades: boolean;
};

/**
 * Auto-derives the listing type label from the have/want configuration.
 *
 * - Has cards + accepts cash only → 'wts'
 * - Has cards + accepts trades only → 'wtt'
 * - Has cards + accepts both → 'wts' (primary label; user can override)
 * - No cards (want-only) → 'wtb'
 */
export const deriveListingType = ({
  hasCards,
  acceptsCash,
  acceptsTrades,
}: DeriveListingTypeParams): ListingType => {
  if (!hasCards) return 'wtb';
  if (acceptsCash && !acceptsTrades) return 'wts';
  if (!acceptsCash && acceptsTrades) return 'wtt';
  // Both or neither — default to 'wts'
  return 'wts';
};
