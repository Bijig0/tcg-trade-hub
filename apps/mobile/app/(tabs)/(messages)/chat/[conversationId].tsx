import { useLocalSearchParams } from 'expo-router';
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

  return (
    <ChatThread
      conversationId={params.conversationId!}
      matchId={params.matchId!}
      otherUser={{
        id: params.otherUserId!,
        name: params.otherUserName!,
        avatar: params.otherUserAvatar ?? null,
      }}
    />
  );
};

export default ChatRoute;
