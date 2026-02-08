/**
 * complete-meetup Edge Function
 *
 * POST { meetup_id: string }
 * Returns { meetup, both_completed: boolean }
 *
 * Sets the current user's completion flag on a meetup.
 * If both parties have completed, finalizes the meetup and match,
 * and increments both users' total_trades counters.
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

    const { meetup_id } = body as { meetup_id?: string };

    // Validate meetup_id
    if (!meetup_id || typeof meetup_id !== 'string') {
      return errorResponse('meetup_id is required and must be a string');
    }

    // Fetch the meetup with its match
    const { data: meetup, error: meetupError } = await supabaseAdmin
      .from('meetups')
      .select(`
        *,
        matches!inner (
          id,
          user_a_id,
          user_b_id,
          status
        )
      `)
      .eq('id', meetup_id)
      .single();

    if (meetupError || !meetup) {
      return errorResponse('Meetup not found', 404);
    }

    const match = meetup.matches as {
      id: string;
      user_a_id: string;
      user_b_id: string;
      status: string;
    };

    // Verify user is a participant
    const isUserA = match.user_a_id === user.id;
    const isUserB = match.user_b_id === user.id;

    if (!isUserA && !isUserB) {
      return errorResponse('You are not a participant in this meetup', 403);
    }

    // Check meetup is in a completable state
    if (meetup.status === 'completed') {
      return errorResponse('Meetup is already completed', 400);
    }
    if (meetup.status === 'cancelled') {
      return errorResponse('Meetup has been cancelled', 400);
    }

    // Determine which completion flag to set
    const completionField = isUserA ? 'user_a_completed' : 'user_b_completed';

    // Check if user already marked as completed
    if (
      (isUserA && meetup.user_a_completed) ||
      (isUserB && meetup.user_b_completed)
    ) {
      return errorResponse('You have already marked this meetup as completed', 400);
    }

    // Set the user's completion flag
    const { data: updatedMeetup, error: updateError } = await supabaseAdmin
      .from('meetups')
      .update({ [completionField]: true })
      .eq('id', meetup_id)
      .select()
      .single();

    if (updateError || !updatedMeetup) {
      console.error('Meetup update error:', updateError);
      return errorResponse('Failed to update meetup', 500);
    }

    // Check if both users have now completed
    const bothCompleted =
      updatedMeetup.user_a_completed && updatedMeetup.user_b_completed;

    if (bothCompleted) {
      // Finalize the meetup
      const { data: finalMeetup, error: finalizeError } = await supabaseAdmin
        .from('meetups')
        .update({ status: 'completed' })
        .eq('id', meetup_id)
        .select()
        .single();

      if (finalizeError) {
        console.error('Meetup finalize error:', finalizeError);
      }

      // Update match status to completed
      await supabaseAdmin
        .from('matches')
        .update({ status: 'completed' })
        .eq('id', match.id);

      // Increment total_trades for both users
      // Use raw SQL via rpc or do sequential updates
      const { data: userAData } = await supabaseAdmin
        .from('users')
        .select('total_trades')
        .eq('id', match.user_a_id)
        .single();

      const { data: userBData } = await supabaseAdmin
        .from('users')
        .select('total_trades')
        .eq('id', match.user_b_id)
        .single();

      if (userAData) {
        await supabaseAdmin
          .from('users')
          .update({ total_trades: (userAData.total_trades ?? 0) + 1 })
          .eq('id', match.user_a_id);
      }

      if (userBData) {
        await supabaseAdmin
          .from('users')
          .update({ total_trades: (userBData.total_trades ?? 0) + 1 })
          .eq('id', match.user_b_id);
      }

      return jsonResponse({
        meetup: finalMeetup ?? updatedMeetup,
        both_completed: true,
      });
    }

    return jsonResponse({
      meetup: updatedMeetup,
      both_completed: false,
    });
  } catch (err) {
    console.error('complete-meetup error:', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return errorResponse(message, 500);
  }
});
