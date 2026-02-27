export type DemoMessageType = 'system' | 'text' | 'card_offer' | 'meetup_proposal';
export type DemoSender = 'system' | 'other';

export type DemoMessage = {
  id: string;
  type: DemoMessageType;
  sender: DemoSender;
  text?: string;
};

export const demoConversation: DemoMessage[] = [
  {
    id: '1',
    type: 'system',
    sender: 'system',
    text: 'You matched with TraderMike on a Charizard listing',
  },
  {
    id: '2',
    type: 'text',
    sender: 'other',
    text: "Hey! I saw your listing. I have a Charizard ex from 151 - would you trade?",
  },
  {
    id: '3',
    type: 'text',
    sender: 'other',
    text: "Here's what I'm thinking:",
  },
  {
    id: '4',
    type: 'card_offer',
    sender: 'other',
  },
  {
    id: '5',
    type: 'text',
    sender: 'other',
    text: 'Let me know what you think!',
  },
  {
    id: '6',
    type: 'meetup_proposal',
    sender: 'other',
  },
  {
    id: '7',
    type: 'system',
    sender: 'system',
    text: 'Tap the trade offer above to respond with your cards',
  },
];
