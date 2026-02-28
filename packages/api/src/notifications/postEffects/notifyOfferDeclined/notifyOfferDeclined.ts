import type { PostEffect } from '../../../pipelines/definePipeline/definePipeline';
import sendPushNotification from '../../sendPushNotification/sendPushNotification';

type OfferDeclinedInput = {
  offerId: string;
  listingId: string;
};

type OfferDeclinedResult = {
  success: boolean;
};

/**
 * Sends a push notification to the offerer when their offer is declined.
 */
const notifyOfferDeclined: PostEffect<OfferDeclinedInput, OfferDeclinedResult> = {
  name: 'notifyOfferDeclined',
  run: async (input, _result, context) => {
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
      body: 'Declined your trade offer',
      data: { offerId: input.offerId },
    });
  },
};

export default notifyOfferDeclined;
