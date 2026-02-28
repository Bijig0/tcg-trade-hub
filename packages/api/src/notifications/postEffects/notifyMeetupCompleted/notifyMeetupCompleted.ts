import type { PostEffect } from '../../../pipelines/definePipeline/definePipeline';
import sendPushNotification from '../../sendPushNotification/sendPushNotification';

type MeetupCompletedInput = {
  meetupId: string;
};

type MeetupCompletedResult = {
  meetup_id: string;
  both_completed: boolean;
};

/**
 * Sends a push notification to the other meetup participant when one side
 * marks the meetup as complete. Skips when both have already completed
 * (both_completed === true) since the meetup is fully finalized.
 */
const notifyMeetupCompleted: PostEffect<MeetupCompletedInput, MeetupCompletedResult> = {
  name: 'notifyMeetupCompleted',
  run: async (input, result, context) => {
    // Only notify when one side completed but the other hasn't yet
    if (result.both_completed) return;

    const sb = context.adminSupabase ?? context.supabase;

    const { data: meetup } = await sb
      .from('meetups')
      .select('match_id')
      .eq('id', result.meetup_id)
      .single();

    if (!meetup) return;

    const { data: match } = await sb
      .from('matches')
      .select('user_a_id, user_b_id')
      .eq('id', meetup.match_id)
      .single();

    if (!match) return;

    const otherUserId =
      match.user_a_id === context.userId ? match.user_b_id : match.user_a_id;

    const { data: sender } = await sb
      .from('profiles')
      .select('display_name')
      .eq('id', context.userId)
      .single();

    const senderName = sender?.display_name ?? 'Someone';

    await sendPushNotification(sb, {
      recipientUserId: otherUserId,
      title: `${senderName} - Meetup`,
      body: 'Marked the meetup as complete',
      data: { meetupId: result.meetup_id },
    });
  },
};

export default notifyMeetupCompleted;
