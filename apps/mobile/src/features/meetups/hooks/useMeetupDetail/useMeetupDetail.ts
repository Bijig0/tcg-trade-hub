import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { meetupKeys } from '../../queryKeys';
import type {
  MeetupRow,
  ShopRow,
  UserRow,
  MatchRow,
  ConversationRow,
  ListingItemRow,
  OfferItemRow,
} from '@tcg-trade-hub/database';

export type MeetupDetail = MeetupRow & {
  match: MatchRow;
  shop: ShopRow | null;
  other_user: Pick<
    UserRow,
    'id' | 'display_name' | 'avatar_url' | 'rating_score' | 'total_trades'
  >;
  conversation: Pick<ConversationRow, 'id'> | null;
  is_user_a: boolean;
  shopCoords: { latitude: number; longitude: number } | null;
  listingItems: ListingItemRow[];
  offerItems: OfferItemRow[];
};

/**
 * Parses a PostGIS geography/geometry value to lat/lng coordinates.
 * Handles GeoJSON `{ type: 'Point', coordinates: [lng, lat] }` and
 * WKT `POINT(lng lat)` string formats.
 */
const parseLocationCoords = (
  location: unknown,
): { latitude: number; longitude: number } | null => {
  if (!location) return null;

  // GeoJSON format: { type: 'Point', coordinates: [lng, lat] }
  if (typeof location === 'object' && location !== null) {
    const geo = location as Record<string, unknown>;
    if (Array.isArray(geo.coordinates) && geo.coordinates.length >= 2) {
      const [lng, lat] = geo.coordinates as number[];
      if (typeof lat === 'number' && typeof lng === 'number') {
        return { latitude: lat, longitude: lng };
      }
    }
  }

  // WKT format: "POINT(lng lat)"
  if (typeof location === 'string') {
    const wktMatch = location.match(/POINT\(\s*([-\d.]+)\s+([-\d.]+)\s*\)/i);
    if (wktMatch) {
      const lng = parseFloat(wktMatch[1]);
      const lat = parseFloat(wktMatch[2]);
      if (!isNaN(lat) && !isNaN(lng)) {
        return { latitude: lat, longitude: lng };
      }
    }
  }

  return null;
};

/**
 * Hook that fetches a single meetup by ID with all joined data.
 *
 * Resolves the match, both users, the shop location, and the related
 * conversation for the match. Also fetches listing_items, offer_items,
 * and parses shop coordinates for the map view.
 */
const useMeetupDetail = (meetupId: string) => {
  return useQuery<MeetupDetail, Error>({
    queryKey: meetupKeys.detail(meetupId),
    queryFn: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user ?? null;

      if (!user) throw new Error('Not authenticated');

      const { data: meetup, error } = await supabase
        .from('meetups')
        .select(
          `
          id,
          match_id,
          proposal_message_id,
          shop_id,
          location_name,
          location_coords,
          proposed_time,
          status,
          user_a_completed,
          user_b_completed,
          created_at,
          updated_at,
          match:matches (
            id,
            user_a_id,
            user_b_id,
            listing_id,
            offer_id,
            status,
            created_at,
            updated_at
          ),
          shop:shops (
            id,
            name,
            address,
            location,
            hours,
            website,
            phone,
            supported_tcgs,
            verified,
            created_at,
            updated_at
          )
        `,
        )
        .eq('id', meetupId)
        .single();

      if (error) throw error;
      if (!meetup) throw new Error('Meetup not found');

      const match = (meetup as Record<string, unknown>).match as MatchRow;
      const shop = (meetup as Record<string, unknown>).shop as (ShopRow & { location?: unknown }) | null;
      const isUserA = match.user_a_id === user.id;
      const otherUserId = isUserA ? match.user_b_id : match.user_a_id;

      // Fetch other user's profile, listing items, offer items, and conversation in parallel
      const [userResult, conversationResult, listingItemsResult, offerItemsResult] =
        await Promise.all([
          supabase
            .from('users')
            .select('id, display_name, avatar_url, rating_score, total_trades')
            .eq('id', otherUserId)
            .single(),
          supabase
            .from('conversations')
            .select('id')
            .eq('match_id', match.id)
            .single(),
          supabase
            .from('listing_items')
            .select('*')
            .eq('listing_id', match.listing_id),
          supabase
            .from('offer_items')
            .select('*')
            .eq('offer_id', match.offer_id),
        ]);

      if (userResult.error) throw userResult.error;

      // Parse shop coordinates (prefer shop location, fall back to meetup location_coords)
      const shopCoords =
        parseLocationCoords(shop?.location) ??
        parseLocationCoords((meetup as Record<string, unknown>).location_coords);

      return {
        ...(meetup as unknown as MeetupRow),
        match,
        shop: shop as ShopRow | null,
        other_user: userResult.data ?? {
          id: otherUserId,
          display_name: 'Unknown',
          avatar_url: null,
          rating_score: 0,
          total_trades: 0,
        },
        conversation: conversationResult.data ?? null,
        is_user_a: isUserA,
        shopCoords,
        listingItems: (listingItemsResult.data ?? []) as ListingItemRow[],
        offerItems: (offerItemsResult.data ?? []) as OfferItemRow[],
      };
    },
    enabled: !!meetupId,
  });
};

export default useMeetupDetail;
