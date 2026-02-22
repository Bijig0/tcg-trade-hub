/**
 * initiate-contact Edge Function
 *
 * POST { my_listing_id: string, their_listing_id: string }
 *
 * Creates a match + conversation between two listings for pre-match
 * direct contact from the owner's listing detail page.
 *
 * Returns { match_id: string, conversation_id: string }
 */
import { handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts';
import { supabaseAdmin, getUser } from '../_shared/supabaseAdmin.ts';

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

    const { my_listing_id, their_listing_id } = body as {
      my_listing_id?: string;
      their_listing_id?: string;
    };

    if (!my_listing_id || typeof my_listing_id !== 'string') {
      return errorResponse('my_listing_id is required and must be a string');
    }
    if (!their_listing_id || typeof their_listing_id !== 'string') {
      return errorResponse('their_listing_id is required and must be a string');
    }

    // Verify ownership of my_listing_id
    const { data: myListing, error: myListingError } = await supabaseAdmin
      .from('listings')
      .select('id, user_id')
      .eq('id', my_listing_id)
      .single();

    if (myListingError || !myListing) {
      return errorResponse('Your listing not found', 404);
    }

    if (myListing.user_id !== user.id) {
      return errorResponse('You do not own this listing', 403);
    }

    // Fetch their listing
    const { data: theirListing, error: theirListingError } = await supabaseAdmin
      .from('listings')
      .select('id, user_id')
      .eq('id', their_listing_id)
      .single();

    if (theirListingError || !theirListing) {
      return errorResponse('Their listing not found', 404);
    }

    const otherUserId = theirListing.user_id;

    // Determine user_a (lower UUID) and user_b (higher UUID) for consistency
    const [userAId, userBId, listingAId, listingBId] =
      user.id < otherUserId
        ? [user.id, otherUserId, my_listing_id, their_listing_id]
        : [otherUserId, user.id, their_listing_id, my_listing_id];

    // Check for existing match between these listings
    const { data: existingMatch } = await supabaseAdmin
      .from('matches')
      .select('id')
      .eq('user_a_id', userAId)
      .eq('user_b_id', userBId)
      .eq('listing_a_id', listingAId)
      .eq('listing_b_id', listingBId)
      .maybeSingle();

    if (existingMatch) {
      // Return existing conversation
      const { data: existingConvo } = await supabaseAdmin
        .from('conversations')
        .select('id')
        .eq('match_id', existingMatch.id)
        .maybeSingle();

      return jsonResponse({
        match_id: existingMatch.id,
        conversation_id: existingConvo?.id ?? null,
      });
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
      .in('id', [my_listing_id, their_listing_id]);

    // Create conversation for this match
    const { data: conversation, error: convoError } = await supabaseAdmin
      .from('conversations')
      .insert({ match_id: match.id })
      .select()
      .single();

    if (convoError || !conversation) {
      console.error('Conversation insert error:', convoError);
      return jsonResponse({ match_id: match.id, conversation_id: null });
    }

    // Insert system message
    await supabaseAdmin.from('messages').insert({
      conversation_id: conversation.id,
      sender_id: user.id,
      type: 'system',
      body: 'Contact initiated! Start chatting to arrange a trade.',
      payload: { event: 'contact_initiated' },
    });

    return jsonResponse({
      match_id: match.id,
      conversation_id: conversation.id,
    });
  } catch (err) {
    console.error('initiate-contact error:', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return errorResponse(message, 500);
  }
});
