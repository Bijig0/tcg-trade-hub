import React from 'react';
import { View, Text, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MessageSquare } from 'lucide-react-native';
import { cn } from '@/lib/cn';
import Avatar from '@/components/ui/Avatar/Avatar';
import EmptyState from '@/components/ui/EmptyState/EmptyState';
import Skeleton from '@/components/ui/Skeleton/Skeleton';
import useConversations, {
  type ConversationPreview,
} from '../../hooks/useConversations/useConversations';
import formatMessage from '../../utils/formatMessage/formatMessage';

type ConversationItemProps = {
  conversation: ConversationPreview;
  onPress: () => void;
};

const ConversationItem = ({ conversation, onPress }: ConversationItemProps) => {
  const { otherUser, lastMessage, unreadCount } = conversation;

  const initials = otherUser.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const preview = lastMessage
    ? formatMessage({ type: lastMessage.type, body: lastMessage.body })
    : 'No messages yet';

  const timeLabel = lastMessage
    ? formatRelativeTime(lastMessage.createdAt)
    : '';

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 border-b border-border px-4 py-3 active:bg-accent"
    >
      <View className="relative">
        <Avatar uri={otherUser.avatar} fallback={initials} size="lg" />
        {unreadCount > 0 ? (
          <View className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-primary" />
        ) : null}
      </View>

      <View className="flex-1">
        <View className="flex-row items-center justify-between">
          <Text
            className={cn(
              'text-base text-foreground',
              unreadCount > 0 ? 'font-bold' : 'font-medium',
            )}
            numberOfLines={1}
          >
            {otherUser.name}
          </Text>
          {timeLabel ? (
            <Text className="text-xs text-muted-foreground">{timeLabel}</Text>
          ) : null}
        </View>
        <Text
          className={cn(
            'mt-0.5 text-sm',
            unreadCount > 0
              ? 'font-medium text-foreground'
              : 'text-muted-foreground',
          )}
          numberOfLines={1}
        >
          {preview}
        </Text>
      </View>
    </Pressable>
  );
};

/** Screen showing all conversation previews sorted by most recent message */
const ConversationsScreen = () => {
  const router = useRouter();
  const { data: conversations, isLoading, refetch } = useConversations();

  const handlePress = (conversationId: string) => {
    router.push(`/(tabs)/chat/${conversationId}`);
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        {Array.from({ length: 5 }).map((_, i) => (
          <View key={i} className="flex-row items-center gap-3 px-4 py-3">
            <Skeleton className="h-14 w-14 rounded-full" />
            <View className="flex-1 gap-2">
              <Skeleton className="h-4 w-32 rounded" />
              <Skeleton className="h-3 w-48 rounded" />
            </View>
          </View>
        ))}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.conversationId}
        renderItem={({ item }) => (
          <ConversationItem
            conversation={item}
            onPress={() => handlePress(item.conversationId)}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon={
              <MessageSquare
                size={48}
                color="#9ca3af"
              />
            }
            title="No conversations yet"
            description="Match with traders to start chatting!"
          />
        }
        onRefresh={refetch}
        refreshing={isLoading}
      />
    </SafeAreaView>
  );
};

export default ConversationsScreen;

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const formatRelativeTime = (isoDate: string): string => {
  const now = Date.now();
  const then = new Date(isoDate).getTime();
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60_000);

  if (diffMins < 1) return 'now';
  if (diffMins < 60) return `${diffMins}m`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d`;
  return new Date(isoDate).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
  });
};
