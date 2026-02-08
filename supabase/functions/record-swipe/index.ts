/**
 * record-swipe Edge Function
 *
 * POST { listing_id: string, direction: 'like' | 'pass' }
 * Returns { match?: Match }
 *
 * Records a swipe on a listing. If direction is 'like', checks for mutual
 * interest: does the listing owner have a 'like' swipe on any of the current
 * user's active listings? If so, creates a match, conversation, and system message.
 */
import { handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts';
import { supabaseAdmin, getUser } from '../_shared/supabaseAdmin.ts';

const VALID_DIRECTIONS = ['like', 'pass'] as const;

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

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return errorResponse('Invalid JSON body');
    }

    const { listing_id, direction } = body as {
      listing_id?: string;
      direction?: string;
    };

    // Validate listing_id
    if (!listing_id || typeof listing_id !== 'string') {
      return errorResponse('listing_id is required and must be a string');
    }

    // Validate direction
    if (!direction || !VALID_DIRECTIONS.includes(direction as 'like' | 'pass')) {
      return errorResponse(
        `direction is required and must be one of: ${VALID_DIRECTIONS.join(', ')}`,
      );
    }

    // Verify listing exists and is active
    const { data: listing, error: listingError } = await supabaseAdmin
      .from('listings')
      .select('id, user_id, tcg, card_external_id, type, status')
      .eq('id', listing_id)
      .single();

    if (listingError || !listing) {
      return errorResponse('Listing not found', 404);
    }

    if (listing.status !== 'active') {
      return errorResponse('Listing is no longer active', 400);
    }

    if (listing.user_id === user.id) {
      return errorResponse('Cannot swipe on your own listing', 400);
    }

    // Check for duplicate swipe
    const { data: existingSwipe } = await supabaseAdmin
      .from('swipes')
      .select('id')
      .eq('user_id', user.id)
      .eq('listing_id', listing_id)
      .maybeSingle();

    if (existingSwipe) {
      return errorResponse('Already swiped on this listing', 409);
    }

    // Insert the swipe
    const { error: swipeError } = await supabaseAdmin
      .from('swipes')
      .insert({
        user_id: user.id,
        listing_id,
        direction,
      });

    if (swipeError) {
      console.error('Swipe insert error:', swipeError);
      return errorResponse('Failed to record swipe', 500);
    }

    // If direction is 'pass', we are done
    if (direction === 'pass') {
      return jsonResponse({ match: null });
    }

    // Direction is 'like' -- check for mutual interest
    // Find if listing owner has liked any of current user's active listings
    const { data: myListings } = await supabaseAdmin
      .from('listings')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'active');

    if (!myListings || myListings.length === 0) {
      return jsonResponse({ match: null });
    }

    const myListingIds = myListings.map((l: { id: string }) => l.id);

    // Check if listing owner has liked any of my listings
    const { data: mutualSwipes } = await supabaseAdmin
      .from('swipes')
      .select('id, listing_id')
      .eq('user_id', listing.user_id)
      .eq('direction', 'like')
      .in('listing_id', myListingIds)
      .limit(1);

    if (!mutualSwipes || mutualSwipes.length === 0) {
      return jsonResponse({ match: null });
    }

    // Mutual interest found -- create match
    const mutualSwipe = mutualSwipes[0];
    const myMatchedListingId = mutualSwipe.listing_id;

    // Determine user_a (lower UUID) and user_b (higher UUID) for consistency
    const [userAId, userBId, listingAId, listingBId] =
      user.id < listing.user_id
        ? [user.id, listing.user_id, myMatchedListingId, listing_id]
        : [listing.user_id, user.id, listing_id, myMatchedListingId];

    // Check if match already exists between these users for these listings
    const { data: existingMatch } = await supabaseAdmin
      .from('matches')
      .select('id')
      .eq('user_a_id', userAId)
      .eq('user_b_id', userBId)
      .eq('listing_a_id', listingAId)
      .eq('listing_b_id', listingBId)
      .maybeSingle();

    if (existingMatch) {
      return jsonResponse({ match: existingMatch });
    }

    // Create match
    const { data: match, error: matchError } = await supabaseAdmin
      .from('matches')
      .insert({
        user_a_id: userAId,
        user_b_id: userBId,
        listing_a_id: listingAId,
        listing_b_id: listingBId,
        status: 'active',
      })
      .select()
      .single();

    if (matchError || !match) {
      console.error('Match insert error:', matchError);
      return errorResponse('Failed to create match', 500);
    }

    // Update both listings to 'matched' status
    await supabaseAdmin
      .from('listings')
      .update({ status: 'matched' })
      .in('id', [listing_id, myMatchedListingId]);

    // Create conversation for this match
    const { data: conversation, error: convoError } = await supabaseAdmin
      .from('conversations')
      .insert({ match_id: match.id })
      .select()
      .single();

    if (convoError || !conversation) {
      console.error('Conversation insert error:', convoError);
      // Match was created, conversation failed -- non-fatal
      return jsonResponse({ match });
    }

    // Insert system message announcing the match
    await supabaseAdmin.from('messages').insert({
      conversation_id: conversation.id,
      sender_id: user.id,
      type: 'system',
      body: 'You matched! Start chatting to arrange a trade.',
      payload: { event: 'match_created' },
    });

    return jsonResponse({ match });
  } catch (err) {
    console.error('record-swipe error:', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return errorResponse(message, 500);
  }
});
