import type { MessageType } from '@tcg-trade-hub/database';

const MAX_PREVIEW_LENGTH = 100;

type FormatMessageInput = {
  type: MessageType;
  body: string | null;
};

/** Format a message for the conversation list preview */
const formatMessage = (message: FormatMessageInput): string => {
  switch (message.type) {
    case 'text': {
      const text = message.body ?? '';
      if (text.length <= MAX_PREVIEW_LENGTH) return text;
      return `${text.slice(0, MAX_PREVIEW_LENGTH)}...`;
    }
    case 'image':
      return 'Sent a photo';
    case 'card_offer':
      return 'Sent a trade offer';
    case 'card_offer_response':
      return 'Responded to a trade offer';
    case 'meetup_proposal':
      return 'Proposed a meetup';
    case 'meetup_response':
      return 'Responded to a meetup proposal';
    case 'system':
      return message.body ?? 'System notification';
    default:
      return '';
  }
};

export default formatMessage;
