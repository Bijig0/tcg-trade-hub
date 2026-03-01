import type { ListingWithDistance } from '../../schemas';
import parseLocationCoords from '@/utils/parseLocationCoords/parseLocationCoords';
import haversineDistance from '@/utils/haversineDistance/haversineDistance';

type RawUserProfile = {
  id: string;
  display_name: string;
  avatar_url: string | null;
  location: unknown;
  rating_score: number;
  total_trades: number;
};

/**
 * Shape of a raw listing row returned from the Supabase query
 * with joined `listing_items` and `users`.
 */
export type RawFeedListing = {
  id: string;
  user_id: string;
  type: string;
  tcg: string;
  title: string;
  cash_amount: number;
  total_value: number;
  description: string | null;
  photos: string[];
  trade_wants: unknown[];
  accepts_cash: boolean;
  accepts_trades: boolean;
  location: unknown;
  location_name: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  listing_items: unknown[] | null;
  users: unknown;
};

type UserCoords = { latitude: number; longitude: number };

/**
 * Transforms a raw Supabase listing row (with joined relations)
 * into the `ListingWithDistance` shape used by the feed UI.
 *
 * Computes real distance_km using the Haversine formula when
 * both listing location and user location are available.
 * Falls back to 0 when either location is missing.
 */
const transformRawListing = (
  raw: RawFeedListing,
  userLocation?: UserCoords | null,
): ListingWithDistance => {
  const userProfile = raw.users as RawUserProfile;
  const items = (raw.listing_items ?? []) as unknown as ListingWithDistance['items'];

  // Resolve listing location: prefer listing.location, fall back to owner's location
  const listingCoords =
    parseLocationCoords(raw.location) ??
    parseLocationCoords(userProfile.location);

  const distanceKm =
    listingCoords && userLocation
      ? haversineDistance(userLocation, listingCoords)
      : 0;

  return {
    id: raw.id,
    user_id: raw.user_id,
    type: raw.type,
    tcg: raw.tcg,
    title: raw.title,
    cash_amount: raw.cash_amount,
    total_value: raw.total_value,
    description: raw.description,
    photos: raw.photos,
    trade_wants: raw.trade_wants ?? [],
    accepts_cash: raw.accepts_cash ?? false,
    accepts_trades: raw.accepts_trades ?? false,
    location: raw.location ?? null,
    location_name: raw.location_name ?? null,
    status: raw.status,
    created_at: raw.created_at,
    updated_at: raw.updated_at,
    distance_km: Math.round(distanceKm * 10) / 10,
    owner: {
      display_name: userProfile.display_name,
      avatar_url: userProfile.avatar_url,
      rating_score: userProfile.rating_score ?? 0,
      total_trades: userProfile.total_trades ?? 0,
    },
    items,
    offer_count: 0,
  } as ListingWithDistance;
};

export default transformRawListing;
