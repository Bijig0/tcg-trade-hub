/**
 * get-relevant-listings Edge Function
 *
 * POST { listing_id: string, limit?: number }
 *
 * Finds complement listings and nearby shops for a given listing owned
 * by the authenticated user. Used on the owner's listing detail page
 * to show nearby traders and game stores.
 *
 * Returns { listings: RelevantListing[], shops: RelevantShop[] }
 */
import { handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts';
import { supabaseAdmin, getUser } from '../_shared/supabaseAdmin.ts';
import { jitterLocation } from '../_shared/jitterLocation.ts';

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return handleCors();

  try {
    if (req.method !== 'POST') {
      return errorResponse('Method not allowed', 405);
    }

    // Authenticate
    const authHeader = req.headers.get('Authorization');
    const user = await getUser(authHeader);
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }

    const body = await req.json().catch(() => ({}));
    const { listing_id, limit: rawLimit } = body as {
      listing_id?: string;
      limit?: number;
    };

    if (!listing_id || typeof listing_id !== 'string') {
      return errorResponse('listing_id is required and must be a string');
    }

    const limit = Math.min(
      Math.max(1, typeof rawLimit === 'number' ? Math.floor(rawLimit) : DEFAULT_LIMIT),
      MAX_LIMIT,
    );

    // Fetch the listing and verify ownership
    const { data: listing, error: listingError } = await supabaseAdmin
      .from('listings')
      .select('*')
      .eq('id', listing_id)
      .single();

    if (listingError || !listing) {
      return errorResponse('Listing not found', 404);
    }

    if (listing.user_id !== user.id) {
      return errorResponse('You do not own this listing', 403);
    }

    // Fetch owner profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('location, radius_km')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return errorResponse('User profile not found', 404);
    }

    // Fetch blocked users
    const { data: blocks } = await supabaseAdmin
      .from('blocks')
      .select('blocker_id, blocked_id')
      .or(`blocker_id.eq.${user.id},blocked_id.eq.${user.id}`);

    const blockedUserIds = new Set<string>();
    for (const block of blocks ?? []) {
      if (block.blocker_id === user.id) blockedUserIds.add(block.blocked_id);
      else blockedUserIds.add(block.blocker_id);
    }

    // Determine complement criteria based on listing type
    const { type, card_external_id, tcg, trade_wants } = listing;

    let query = supabaseAdmin
      .from('listings')
      .select(`
        *,
        users!inner (
          id,
          display_name,
          avatar_url,
          location,
          rating_score,
          total_trades
        )
      `)
      .eq('status', 'active')
      .neq('user_id', user.id);

    if (type === 'wts') {
      // Find WTB listings for same card + WTT listings whose trade_wants contains the card
      query = query.or(`and(type.eq.wtb,card_external_id.eq.${card_external_id}),type.eq.wtt`);
    } else if (type === 'wtb') {
      // Find WTS listings for same card + WTT listings offering the card
      query = query.or(`and(type.eq.wts,card_external_id.eq.${card_external_id}),type.eq.wtt`);
    } else {
      // WTT: find listings that complement the trade
      query = query.eq('tcg', tcg);
    }

    query = query.order('created_at', { ascending: false }).limit(limit * 3);

    const { data: rawListings, error: listingsError } = await query;

    if (listingsError) {
      console.error('Relevant listings query error:', listingsError);
      return errorResponse('Failed to fetch relevant listings', 500);
    }

    // Post-filter and score
    const scoredListings = (rawListings ?? [])
      .filter((l: Record<string, unknown>) => {
        if (blockedUserIds.has(l.user_id as string)) return false;

        // For WTT owner, check if listing complements trade_wants
        if (type === 'wtt' && l.type === 'wtt') {
          // Check if any of their trade_wants match our card, or our trade_wants match their card
          const theirWants = l.trade_wants as Array<{ card_external_id?: string }> | null;
          const ourWants = trade_wants as Array<{ card_external_id?: string }> | null;
          const theyWantOurs = theirWants?.some((w) => w.card_external_id === card_external_id);
          const weWantTheirs = ourWants?.some((w) => w.card_external_id === l.card_external_id);
          if (!theyWantOurs && !weWantTheirs) return false;
        }

        return true;
      })
      .map((l: Record<string, unknown>) => {
        let score = 0;

        // Direct complement match: +5
        if (type === 'wts' && l.type === 'wtb' && l.card_external_id === card_external_id) {
          score += 5;
        } else if (type === 'wtb' && l.type === 'wts' && l.card_external_id === card_external_id) {
          score += 5;
        } else if (type === 'wtt') {
          const theirWants = l.trade_wants as Array<{ card_external_id?: string }> | null;
          const ourWants = trade_wants as Array<{ card_external_id?: string }> | null;
          if (theirWants?.some((w) => w.card_external_id === card_external_id)) score += 5;
          if (ourWants?.some((w) => w.card_external_id === l.card_external_id)) score += 5;
        }

        // TCG match: +2
        if (l.tcg === tcg) score += 2;

        // Proximity bonus: +2
        const listingUser = l.users as Record<string, unknown> | undefined;
        if (profile.location && listingUser?.location) score += 2;

        // Recency: +1 for listings created within last 7 days
        const createdAt = new Date(l.created_at as string);
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        if (createdAt > sevenDaysAgo) score += 1;

        // Jitter the user's location for privacy
        const ownerUser = l.users as Record<string, unknown>;
        let approximateLat = 0;
        let approximateLng = 0;
        if (ownerUser?.location) {
          // Location is stored as PostGIS geography point
          // Try to extract coordinates - may be GeoJSON or WKT
          const loc = ownerUser.location as Record<string, unknown>;
          if (loc.coordinates && Array.isArray(loc.coordinates)) {
            const coords = loc.coordinates as number[];
            const jittered = jitterLocation(coords[1], coords[0]);
            approximateLat = jittered.lat;
            approximateLng = jittered.lng;
          }
        }

        // Calculate approximate distance (haversine simplified)
        let distanceKm = 0;
        if (profile.location && approximateLat !== 0) {
          const userLoc = profile.location as Record<string, unknown>;
          if (userLoc.coordinates && Array.isArray(userLoc.coordinates)) {
            const userCoords = userLoc.coordinates as number[];
            const dLat = (approximateLat - userCoords[1]) * (Math.PI / 180);
            const dLng = (approximateLng - userCoords[0]) * (Math.PI / 180);
            const a =
              Math.sin(dLat / 2) ** 2 +
              Math.cos(userCoords[1] * (Math.PI / 180)) *
                Math.cos(approximateLat * (Math.PI / 180)) *
                Math.sin(dLng / 2) ** 2;
            distanceKm = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          }
        }

        return {
          id: l.id,
          user_id: l.user_id,
          type: l.type,
          tcg: l.tcg,
          card_name: l.card_name,
          card_set: l.card_set,
          card_number: l.card_number,
          card_external_id: l.card_external_id,
          card_image_url: l.card_image_url,
          card_rarity: l.card_rarity,
          card_market_price: l.card_market_price,
          condition: l.condition,
          asking_price: l.asking_price,
          description: l.description,
          photos: l.photos,
          trade_wants: l.trade_wants,
          status: l.status,
          created_at: l.created_at,
          updated_at: l.updated_at,
          owner: {
            id: (ownerUser.id as string) ?? l.user_id,
            display_name: ownerUser.display_name as string,
            avatar_url: ownerUser.avatar_url as string | null,
            rating_score: ownerUser.rating_score as number,
            total_trades: ownerUser.total_trades as number,
            approximate_lat: approximateLat,
            approximate_lng: approximateLng,
          },
          relevance_score: score,
          distance_km: Math.round(distanceKm * 10) / 10,
        };
      });

    // Sort by score descending, then by recency
    scoredListings.sort(
      (a: { relevance_score: number; created_at: string }, b: { relevance_score: number; created_at: string }) => {
        if (b.relevance_score !== a.relevance_score) return b.relevance_score - a.relevance_score;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      },
    );

    const paginatedListings = scoredListings.slice(0, limit);

    // Fetch nearby shops matching the listing's TCG
    const radiusKm = profile.radius_km ?? 25;
    let shops: Array<Record<string, unknown>> = [];

    const { data: rawShops, error: shopsError } = await supabaseAdmin
      .from('shops')
      .select('id, name, address, location, supported_tcgs, verified')
      .contains('supported_tcgs', [tcg]);

    if (!shopsError && rawShops) {
      shops = rawShops
        .filter((shop: Record<string, unknown>) => {
          if (!shop.location) return false;
          // Basic distance check
          const loc = shop.location as Record<string, unknown>;
          if (!loc.coordinates || !Array.isArray(loc.coordinates)) return false;
          if (!profile.location) return true;

          const userLoc = profile.location as Record<string, unknown>;
          if (!userLoc.coordinates || !Array.isArray(userLoc.coordinates)) return true;

          const shopCoords = loc.coordinates as number[];
          const userCoords = userLoc.coordinates as number[];
          const dLat = (shopCoords[1] - userCoords[1]) * (Math.PI / 180);
          const dLng = (shopCoords[0] - userCoords[0]) * (Math.PI / 180);
          const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(userCoords[1] * (Math.PI / 180)) *
              Math.cos(shopCoords[1] * (Math.PI / 180)) *
              Math.sin(dLng / 2) ** 2;
          const dist = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          return dist <= radiusKm;
        })
        .map((shop: Record<string, unknown>) => {
          const loc = shop.location as Record<string, unknown>;
          const coords = (loc?.coordinates as number[]) ?? [0, 0];
          return {
            id: shop.id,
            name: shop.name,
            address: shop.address,
            lat: coords[1],
            lng: coords[0],
            supported_tcgs: shop.supported_tcgs,
            verified: shop.verified,
          };
        });
    }

    return jsonResponse({
      listings: paginatedListings,
      shops,
    });
  } catch (err) {
    console.error('get-relevant-listings error:', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return errorResponse(message, 500);
  }
});
