import type { ListingRow } from '@tcg-trade-hub/database';

type Point = {
  latitude: number;
  longitude: number;
};

type RankedListing = {
  listing: ListingRow;
  score: number;
};

const WEIGHTS = {
  tcgMatch: 2,
  proximity: 2,
  recency: 1,
} as const;

const RECENCY_DECAY_DAYS = 7;

const computeTcgMatchScore = (
  listing: ListingRow,
  userListings: ListingRow[],
): number => {
  const userTcgs = new Set(userListings.map((ul) => ul.tcg));
  return userTcgs.has(listing.tcg) ? WEIGHTS.tcgMatch : 0;
};

const computeProximityScore = (
  distanceKm: number,
  maxRadiusKm: number,
): number => {
  if (distanceKm >= maxRadiusKm) return 0;
  return WEIGHTS.proximity * (1 - distanceKm / maxRadiusKm);
};

const computeRecencyScore = (createdAt: string): number => {
  const ageMs = Date.now() - new Date(createdAt).getTime();
  const ageDays = ageMs / (1000 * 60 * 60 * 24);
  if (ageDays >= RECENCY_DECAY_DAYS) return 0;
  return WEIGHTS.recency * (1 - ageDays / RECENCY_DECAY_DAYS);
};

/**
 * Ranks listings by weighted score:
 * - TCG match (2): listing TCG matches user's active listing TCGs
 * - Proximity (2): inverse distance, closer = higher
 * - Recency (1): newer listings score higher, decays over 7 days
 *
 * Note: complement matching (card-level overlap) has been removed
 * since listings are now bundles. Real scoring happens in the
 * get-feed Edge Function.
 */
const rankListings = (
  listings: ListingRow[],
  userListings: ListingRow[],
  _userLocation: Point,
  maxRadiusKm = 25,
): RankedListing[] => {
  const ranked = listings.map((listing) => {
    const tcgScore = computeTcgMatchScore(listing, userListings);
    const distanceKm = maxRadiusKm / 2;
    const proximityScore = computeProximityScore(distanceKm, maxRadiusKm);
    const recencyScore = computeRecencyScore(listing.created_at);

    const score = tcgScore + proximityScore + recencyScore;

    return { listing, score };
  });

  ranked.sort((a, b) => b.score - a.score);

  return ranked;
};

export default rankListings;
export type { RankedListing, Point };
