export const chatKeys = {
  all: ['chat'] as const,
  conversations: () => [...chatKeys.all, 'conversations'] as const,
  conversation: (id: string) => [...chatKeys.all, 'conversation', id] as const,
  messages: (conversationId: string) =>
    [...chatKeys.all, 'messages', conversationId] as const,
  tradeContext: (conversationId: string) =>
    [...chatKeys.all, 'tradeContext', conversationId] as const,
  unreadCount: (conversationId: string) =>
    [...chatKeys.all, 'unreadCount', conversationId] as const,
  nickname: (conversationId: string) =>
    [...chatKeys.all, 'nickname', conversationId] as const,
  previousOffer: (conversationId: string) =>
    [...chatKeys.all, 'previousOffer', conversationId] as const,
};
