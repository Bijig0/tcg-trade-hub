import type { ListingWithDistance } from '../../schemas';

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
  status: string;
  created_at: string;
  updated_at: string;
  listing_items: unknown[] | null;
  users: unknown;
};

/**
 * Transforms a raw Supabase listing row (with joined relations)
 * into the `ListingWithDistance` shape used by the feed UI.
 *
 * Distance is currently hardcoded to 0 — will be computed from
 * PostGIS when location-based sorting is implemented.
 */
const transformRawListing = (raw: RawFeedListing): ListingWithDistance => {
  const userProfile = raw.users as RawUserProfile;
  const items = (raw.listing_items ?? []) as unknown as ListingWithDistance['items'];

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
    status: raw.status,
    created_at: raw.created_at,
    updated_at: raw.updated_at,
    distance_km: 0, // TODO: compute from PostGIS when location available
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
