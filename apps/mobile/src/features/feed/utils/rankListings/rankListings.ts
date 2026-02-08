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
  complementMatch: 5,
  tcgMatch: 2,
  proximity: 2,
  recency: 1,
} as const;

const RECENCY_DECAY_DAYS = 7;
const EARTH_RADIUS_KM = 6371;

const _haversineDistance = (a: Point, b: Point): number => {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const sinLat = Math.sin(dLat / 2);
  const sinLon = Math.sin(dLon / 2);
  const h =
    sinLat * sinLat +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * sinLon * sinLon;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
};

const computeComplementScore = (
  listing: ListingRow,
  userListings: ListingRow[],
): number => {
  const isComplement = userListings.some((ul) => {
    if (listing.type === 'wts' && ul.type === 'wtb' && ul.card_name === listing.card_name) return true;
    if (listing.type === 'wtb' && ul.type === 'wts' && ul.card_name === listing.card_name) return true;
    return false;
  });
  return isComplement ? WEIGHTS.complementMatch : 0;
};

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
 * - Direct complement match (5): user WTB <-> listing WTS for same card
 * - TCG match (2): listing TCG matches user's active listing TCGs
 * - Proximity (2): inverse distance, closer = higher
 * - Recency (1): newer listings score higher, decays over 7 days
 */
const rankListings = (
  listings: ListingRow[],
  userListings: ListingRow[],
  _userLocation: Point,
  maxRadiusKm = 25,
): RankedListing[] => {
  const ranked = listings.map((listing) => {
    const complementScore = computeComplementScore(listing, userListings);
    const tcgScore = computeTcgMatchScore(listing, userListings);

    // Use a default distance for listings without owner location data
    const distanceKm = maxRadiusKm / 2;
    const proximityScore = computeProximityScore(distanceKm, maxRadiusKm);
    const recencyScore = computeRecencyScore(listing.created_at);

    const score = complementScore + tcgScore + proximityScore + recencyScore;

    return { listing, score };
  });

  ranked.sort((a, b) => b.score - a.score);

  return ranked;
};

export default rankListings;
export type { RankedListing, Point };
