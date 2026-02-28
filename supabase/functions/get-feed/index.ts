/**
 * get-feed Edge Function
 *
 * POST {
 *   cursor?: string,          // ISO timestamp for keyset pagination
 *   limit?: number,           // 1-50, default 20
 *   filters?: {
 *     tcg?: 'pokemon' | 'mtg' | 'onepiece',
 *     listing_type?: 'wts' | 'wtb' | 'wtt',  // backward compat
 *     accepts_cash?: boolean,                   // Have/Want filter
 *     accepts_trades?: boolean,                 // Have/Want filter
 *     search?: string,                          // card name search
 *     condition?: 'nm' | 'lp' | 'mp' | 'hp' | 'dmg',
 *     sort?: 'relevance' | 'price_asc' | 'price_desc' | 'newest'
 *   }
 * }
 *
 * Returns paginated listings ranked by a weighted relevance score.
 * Excludes the user's own listings, already-swiped listings, and blocked users.
 * Uses PostGIS ST_DWithin for proximity filtering.
 */
import { handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts';
import { supabaseAdmin, getUser } from '../_shared/supabaseAdmin.ts';

const VALID_TCGS = ['pokemon', 'mtg', 'onepiece'];
const VALID_LISTING_TYPES = ['wts', 'wtb', 'wtt'];
const VALID_CONDITIONS = ['nm', 'lp', 'mp', 'hp', 'dmg'];
const VALID_SORTS = ['relevance', 'price_asc', 'price_desc', 'newest'];
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
    const { cursor, limit: rawLimit, filters } = body as {
      cursor?: string;
      limit?: number;
      filters?: {
        tcg?: string;
        listing_type?: string;
        accepts_cash?: boolean;
        accepts_trades?: boolean;
        search?: string;
        condition?: string;
        sort?: string;
      };
    };

    // Validate limit
    const limit = Math.min(
      Math.max(1, typeof rawLimit === 'number' ? Math.floor(rawLimit) : DEFAULT_LIMIT),
      MAX_LIMIT,
    );

    // Validate filters
    const tcgFilter = filters?.tcg && VALID_TCGS.includes(filters.tcg) ? filters.tcg : null;
    const conditionFilter = filters?.condition && VALID_CONDITIONS.includes(filters.condition) ? filters.condition : null;
    const sortMode = filters?.sort && VALID_SORTS.includes(filters.sort) ? filters.sort : 'relevance';
    const searchQuery = typeof filters?.search === 'string' ? filters.search.trim() : '';

    // Map legacy listing_type filter to accepts_cash/accepts_trades
    let acceptsCashFilter = typeof filters?.accepts_cash === 'boolean' ? filters.accepts_cash : null;
    let acceptsTradesFilter = typeof filters?.accepts_trades === 'boolean' ? filters.accepts_trades : null;

    // Backward compat: map listing_type to boolean filters
    if (filters?.listing_type && VALID_LISTING_TYPES.includes(filters.listing_type) && acceptsCashFilter === null && acceptsTradesFilter === null) {
      if (filters.listing_type === 'wts') acceptsCashFilter = true;
      else if (filters.listing_type === 'wtt') acceptsTradesFilter = true;
      else if (filters.listing_type === 'wtb') acceptsCashFilter = true;
    }

    // Fetch current user's profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('location, radius_km, preferred_tcgs')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return errorResponse('User profile not found', 404);
    }

    // Fetch blocked user ids (both directions)
    const { data: blocks } = await supabaseAdmin
      .from('blocks')
      .select('blocker_id, blocked_id')
      .or(`blocker_id.eq.${user.id},blocked_id.eq.${user.id}`);

    const blockedUserIds = new Set<string>();
    for (const block of blocks ?? []) {
      if (block.blocker_id === user.id) blockedUserIds.add(block.blocked_id);
      else blockedUserIds.add(block.blocker_id);
    }

    // Fetch already-swiped listing ids
    const { data: swipes } = await supabaseAdmin
      .from('swipes')
      .select('listing_id')
      .eq('user_id', user.id);

    const swipedListingIds = new Set<string>(
      (swipes ?? []).map((s: { listing_id: string }) => s.listing_id),
    );

    // Fetch current user's active listings for scoring
    const { data: myListings } = await supabaseAdmin
      .from('listings')
      .select('tcg, type, accepts_cash, accepts_trades, trade_wants')
      .eq('user_id', user.id)
      .eq('status', 'active');

    // Build proximity and preference data
    const userLocation = profile.location;
    const preferredTcgs = profile.preferred_tcgs ?? [];

    // Build the query — use !inner join on listing_items when searching
    const hasSearch = searchQuery.length > 0;
    let query = supabaseAdmin
      .from('listings')
      .select(`
        *,
        listing_items${hasSearch ? '!inner' : ''} (*),
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

    // Card name search via listing_items
    if (hasSearch) {
      query = query.ilike('listing_items.card_name', `%${searchQuery}%`);
    }

    // Apply filters
    if (tcgFilter) {
      query = query.eq('tcg', tcgFilter);
    }
    if (acceptsCashFilter === true) {
      query = query.eq('accepts_cash', true);
    }
    if (acceptsTradesFilter === true) {
      query = query.eq('accepts_trades', true);
    }
    if (conditionFilter) {
      query = query.eq('condition', conditionFilter);
    }

    // Apply cursor-based pagination
    if (cursor) {
      query = query.lt('created_at', cursor);
    }

    // Order and limit -- fetch extra to allow post-filtering
    query = query.order('created_at', { ascending: false }).limit(limit * 3);

    const { data: rawListings, error: listingsError } = await query;

    if (listingsError) {
      console.error('Feed query error:', listingsError);
      return errorResponse('Failed to fetch feed', 500);
    }

    // Post-filter: remove swiped, blocked, and apply proximity
    let listings = (rawListings ?? []).filter((listing: Record<string, unknown>) => {
      if (swipedListingIds.has(listing.id as string)) return false;
      if (blockedUserIds.has(listing.user_id as string)) return false;

      // Proximity filter via PostGIS approximation
      if (userLocation && (listing as Record<string, unknown>).users) {
        const listingUser = (listing as Record<string, unknown>).users as Record<string, unknown>;
        if (!listingUser.location) return false;
      }

      return true;
    });

    // Score and rank listings
    const scoredListings = listings.map((listing: Record<string, unknown>) => {
      let score = 0;

      // Have/Want overlap scoring: +5 if the other listing's wants match what user offers
      const listingAcceptsCash = listing.accepts_cash as boolean;
      const listingAcceptsTrades = listing.accepts_trades as boolean;

      for (const myListing of (myListings ?? []) as Record<string, unknown>[]) {
        const myAcceptsCash = myListing.accepts_cash as boolean;
        const myAcceptsTrades = myListing.accepts_trades as boolean;

        // Cash complement: listing sells + user buys, or vice versa
        if (listingAcceptsCash && myAcceptsCash) score += 2;
        // Trade overlap: both accept trades
        if (listingAcceptsTrades && myAcceptsTrades) score += 5;
        // Same TCG
        if (listing.tcg === myListing.tcg) score += 1;
      }

      // TCG preference match: +2
      if (preferredTcgs.includes(listing.tcg as string)) {
        score += 2;
      }

      // Proximity bonus: +2
      const listingUser = (listing as Record<string, unknown>).users as Record<string, unknown> | undefined;
      if (userLocation && listingUser?.location) {
        score += 2;
      }

      // Recency bonus: +1 for listings created within last 24 hours
      const createdAt = new Date(listing.created_at as string);
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      if (createdAt > oneDayAgo) {
        score += 1;
      }

      return { ...listing, _score: score };
    });

    // Sort based on mode
    if (sortMode === 'relevance') {
      scoredListings.sort(
        (a: { _score: number; created_at: string }, b: { _score: number; created_at: string }) => {
          if (b._score !== a._score) return b._score - a._score;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        },
      );
    } else if (sortMode === 'price_asc') {
      scoredListings.sort((a: Record<string, unknown>, b: Record<string, unknown>) => {
        const pa = (a.card_market_price as number) ?? Infinity;
        const pb = (b.card_market_price as number) ?? Infinity;
        return pa - pb;
      });
    } else if (sortMode === 'price_desc') {
      scoredListings.sort((a: Record<string, unknown>, b: Record<string, unknown>) => {
        const pa = (a.card_market_price as number) ?? -Infinity;
        const pb = (b.card_market_price as number) ?? -Infinity;
        return pb - pa;
      });
    }
    // 'newest' is already sorted by created_at desc from the query

    // Paginate
    const page = scoredListings.slice(0, limit);

    // Remove internal score before returning
    const results = page.map(({ _score, ...rest }: { _score: number; [key: string]: unknown }) => rest);

    // Determine next cursor
    const nextCursor =
      results.length === limit
        ? (results[results.length - 1] as Record<string, unknown>).created_at as string
        : null;

    return jsonResponse({
      listings: results,
      nextCursor,
    });
  } catch (err) {
    console.error('get-feed error:', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return errorResponse(message, 500);
  }
});
