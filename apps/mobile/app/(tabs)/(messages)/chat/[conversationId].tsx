import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { ChatThread } from '@/features/chat';

type ChatParams = {
  conversationId: string;
  matchId: string;
  otherUserId: string;
  otherUserName: string;
  otherUserAvatar?: string;
};

const ChatRoute = () => {
  const params = useLocalSearchParams<ChatParams>();
  const router = useRouter();

  const handleOpenOffer = useCallback(() => {
    router.push({
      pathname: '/(tabs)/(messages)/offer-detail',
      params: { conversationId: params.conversationId },
    });
  }, [router, params.conversationId]);

  const handleCounterOffer = useCallback((_prefill: unknown) => {
    router.push({
      pathname: '/(tabs)/(messages)/offer-detail',
      params: { conversationId: params.conversationId },
    });
  }, [router, params.conversationId]);

  return (
    <ChatThread
      conversationId={params.conversationId ?? ''}
      matchId={params.matchId ?? ''}
      otherUser={{
        id: params.otherUserId ?? '',
        name: params.otherUserName ?? 'Unknown',
        avatar: params.otherUserAvatar ?? null,
      }}
      onOpenOfferModal={handleOpenOffer}
      onOpenCounterOffer={handleCounterOffer}
    />
  );
};

export default ChatRoute;
