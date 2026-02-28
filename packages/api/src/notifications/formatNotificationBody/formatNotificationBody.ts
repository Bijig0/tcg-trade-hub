type NotificationContent = {
  title: string;
  body: string;
};

/**
 * Formats push notification title and body based on message type.
 * Used by postEffects that send push notifications for chat messages.
 */
const formatNotificationBody = (
  senderName: string,
  messageType: string,
  body: string | null,
): NotificationContent => {
  switch (messageType) {
    case 'text':
      return { title: senderName, body: body ?? 'Sent a message' };
    case 'image':
      return { title: senderName, body: 'Sent an image' };
    case 'card_offer':
      return { title: `${senderName} - Trade Offer`, body: 'Sent you a card trade offer' };
    case 'card_offer_response':
      return { title: `${senderName} - Trade Response`, body: 'Responded to your trade offer' };
    case 'meetup_proposal':
      return { title: `${senderName} - Meetup Proposal`, body: 'Proposed a meetup location and time' };
    case 'meetup_response':
      return { title: `${senderName} - Meetup Response`, body: 'Responded to your meetup proposal' };
    case 'system':
      return { title: 'TCG Trade Hub', body: body ?? 'New system notification' };
    default:
      return { title: senderName, body: body ?? 'New message' };
  }
};

export default formatNotificationBody;
export type { NotificationContent };
