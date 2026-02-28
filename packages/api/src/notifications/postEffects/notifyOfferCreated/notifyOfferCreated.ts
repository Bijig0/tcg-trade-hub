import type { PostEffect } from '../../../pipelines/definePipeline/definePipeline';
import sendPushNotification from '../../sendPushNotification/sendPushNotification';

type OfferCreatedInput = {
  listingId: string;
};

type OfferCreatedResult = {
  offer_id: string;
};

/**
 * Sends a push notification to the listing owner when a new offer is created.
 * Skips if the sender is the listing owner (shouldn't happen, but defensive).
 */
const notifyOfferCreated: PostEffect<OfferCreatedInput, OfferCreatedResult> = {
  name: 'notifyOfferCreated',
  run: async (input, result, context) => {
    const sb = context.adminSupabase ?? context.supabase;

    const { data: listing } = await sb
      .from('listings')
      .select('user_id')
      .eq('id', input.listingId)
      .single();

    if (!listing || listing.user_id === context.userId) return;

    const { data: sender } = await sb
      .from('profiles')
      .select('display_name')
      .eq('id', context.userId)
      .single();

    const senderName = sender?.display_name ?? 'Someone';

    await sendPushNotification(sb, {
      recipientUserId: listing.user_id,
      title: `${senderName} - Trade Offer`,
      body: 'Sent you a trade offer',
      data: { offerId: result.offer_id },
    });
  },
};

export { notifyOfferCreated };
