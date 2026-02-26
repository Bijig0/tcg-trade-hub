import { z } from 'zod';
import definePipeline from '../definePipeline/definePipeline';
import type { PreCheck } from '../definePipeline/definePipeline';

const CompleteMeetupInputSchema = z.object({
  meetupId: z.string().uuid(),
});

type CompleteMeetupInput = z.infer<typeof CompleteMeetupInputSchema>;

const CompleteMeetupResultSchema = z.object({
  meetup_id: z.string().uuid(),
  both_completed: z.boolean(),
});

type CompleteMeetupResult = z.infer<typeof CompleteMeetupResultSchema>;

/**
 * Verifies the meetup exists, is in 'confirmed' state, and the user is a participant.
 */
const checkMeetupParticipant: PreCheck<CompleteMeetupInput> = {
  name: 'checkMeetupParticipant',
  run: async (input, ctx) => {
    const { data: meetup, error } = await ctx.supabase
      .from('meetups')
      .select('id, status, match_id')
      .eq('id', input.meetupId)
      .single();

    if (error || !meetup) throw new Error('Meetup not found');
    if (meetup.status !== 'confirmed') throw new Error(`Meetup is not in confirmed state (current: ${meetup.status})`);

    const { data: match, error: matchError } = await ctx.supabase
      .from('matches')
      .select('user_a_id, user_b_id')
      .eq('id', meetup.match_id)
      .single();

    if (matchError || !match) throw new Error('Match not found for meetup');
    if (match.user_a_id !== ctx.userId && match.user_b_id !== ctx.userId) {
      throw new Error('Not a participant in this meetup');
    }
  },
};

/**
 * Marks the current user's completion flag on a meetup.
 * If both parties have completed, atomically finalizes the meetup, match,
 * and increments both users' total_trades counters.
 */
const completeMeetup = definePipeline({
  name: 'completeMeetup',
  description:
    'Marks the current user as completed on a meetup. If both parties have completed, ' +
    'atomically finalizes the meetup and match, and increments both users total_trades.',

  inputSchema: CompleteMeetupInputSchema,

  preChecks: [checkMeetupParticipant],

  rpc: {
    functionName: 'complete_meetup_v1',
    mapParams: (input, ctx) => ({
      p_meetup_id: input.meetupId,
      p_user_id: ctx.userId,
    }),
    resultSchema: CompleteMeetupResultSchema,
  },

  postEffects: [],
});

export default completeMeetup;
export { CompleteMeetupInputSchema, CompleteMeetupResultSchema, checkMeetupParticipant };
export type { CompleteMeetupInput, CompleteMeetupResult };
