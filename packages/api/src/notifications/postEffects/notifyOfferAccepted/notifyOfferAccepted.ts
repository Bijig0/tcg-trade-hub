import type { PostEffect } from '../../../pipelines/definePipeline/definePipeline';
import sendPushNotification from '../../sendPushNotification/sendPushNotification';

type OfferAcceptedInput = {
  offerId: string;
  listingId: string;
};

type OfferAcceptedResult = {
  match_id: string;
  conversation_id: string;
  declined_offer_count: number;
};

/**
 * Sends a push notification to the offerer when their offer is accepted.
 */
const notifyOfferAccepted: PostEffect<OfferAcceptedInput, OfferAcceptedResult> = {
  name: 'notifyOfferAccepted',
  run: async (input, result, context) => {
    const sb = context.adminSupabase ?? context.supabase;

    const { data: offer } = await sb
      .from('offers')
      .select('offerer_id')
      .eq('id', input.offerId)
      .single();

    if (!offer) return;

    const { data: sender } = await sb
      .from('profiles')
      .select('display_name')
      .eq('id', context.userId)
      .single();

    const senderName = sender?.display_name ?? 'Someone';

    await sendPushNotification(sb, {
      recipientUserId: offer.offerer_id,
      title: `${senderName} - Trade Offer`,
      body: 'Accepted your trade offer',
      data: { matchId: result.match_id, conversationId: result.conversation_id },
    });
  },
};

export default notifyOfferAccepted;
