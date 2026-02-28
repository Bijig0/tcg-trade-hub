export type DemoMessageType = 'system' | 'text' | 'reservation_card';
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
    text: 'Welcome to TCG Trade Hub',
  },
  {
    id: '2',
    type: 'text',
    sender: 'other',
    text: "Hey! We're building the easiest way to trade cards locally.",
  },
  {
    id: '3',
    type: 'text',
    sender: 'other',
    text: "What cards are you hunting for? Tell us and we'll match you with local traders when we launch.",
  },
  {
    id: '4',
    type: 'reservation_card',
    sender: 'other',
  },
  {
    id: '5',
    type: 'system',
    sender: 'system',
    text: 'Tap above to build your list',
  },
];
