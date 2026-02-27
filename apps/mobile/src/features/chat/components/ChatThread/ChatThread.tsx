import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Send, Handshake, MapPin, Ban, ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { cn } from '@/lib/cn';
import { useAuth } from '@/context/AuthProvider';
import Avatar from '@/components/ui/Avatar/Avatar';
import ReportModal from '@/features/safety/components/ReportModal/ReportModal';
import useMessages, {
  type MessageWithSender,
} from '../../hooks/useMessages/useMessages';
import useSendMessage from '../../hooks/useSendMessage/useSendMessage';
import useRealtimeChat from '../../hooks/useRealtimeChat/useRealtimeChat';
import useRealtimeMatchUpdates from '@/features/listings/hooks/useRealtimeMatchUpdates/useRealtimeMatchUpdates';
import useTradeContext from '../../hooks/useTradeContext/useTradeContext';
import useConversationNickname from '../../hooks/useConversationNickname/useConversationNickname';
import useMarkAsRead from '../../hooks/useMarkAsRead/useMarkAsRead';
import useTypingIndicator from '../../hooks/useTypingIndicator/useTypingIndicator';
import useNegotiationStatus from '../../hooks/useNegotiationStatus/useNegotiationStatus';
import useChatBlockCheck from '../../hooks/useChatBlockCheck/useChatBlockCheck';
import useLongPressMessage from '../../hooks/useLongPressMessage/useLongPressMessage';
import generateDefaultChatName from '../../utils/generateDefaultChatName/generateDefaultChatName';
import MessageBubble from '../MessageBubble/MessageBubble';
import OfferCard from '../OfferCard/OfferCard';
import MeetupProposalCard from '../MeetupProposalCard/MeetupProposalCard';
import SystemMessage from '../SystemMessage/SystemMessage';
import DevChatActions from '../DevChatActions/DevChatActions';
import TradeContextHeader from '../TradeContextHeader/TradeContextHeader';
import TypingIndicator from '../TypingIndicator/TypingIndicator';
import ChatHeaderActions from '../ChatHeaderActions/ChatHeaderActions';
import type {
  CardOfferResponsePayload,
  MeetupResponsePayload,
  CardOfferPayload,
  CardRef,
  MessageRow,
} from '@tcg-trade-hub/database';

export type ChatThreadProps = {
  conversationId: string;
  matchId: string;
  otherUser: {
    id: string;
    name: string;
    avatar: string | null;
  };
  onOpenOfferModal?: () => void;
  onOpenMeetupModal?: () => void;
  onOpenCounterOffer?: (prefillData: CardOfferPayload) => void;
};

/** Full chat screen with message list, input bar, and toolbar */
const ChatThread = ({
  conversationId,
  matchId,
  otherUser,
  onOpenOfferModal,
  onOpenMeetupModal,
  onOpenCounterOffer,
}: ChatThreadProps) => {
  const { user } = useAuth();
  const router = useRouter();
  const [text, setText] = useState('');
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useMessages(conversationId);
  const sendMessage = useSendMessage();

  // Trade context and nickname
  const { data: tradeContext } = useTradeContext(conversationId);
  const defaultChatName = generateDefaultChatName(
    otherUser.name,
    tradeContext?.listingTitle,
  );
  const { displayName, rename } = useConversationNickname({
    conversationId,
    defaultNickname: defaultChatName,
  });
  const { markAsRead } = useMarkAsRead(conversationId);
  const { isOtherUserTyping, sendTypingStart, sendTypingStop } =
    useTypingIndicator(conversationId);
  const { data: blockState } = useChatBlockCheck(otherUser.id);
  const { handleLongPress, reportTarget, clearReportTarget } =
    useLongPressMessage(user?.id);

  // Subscribe to realtime messages (with read tracking callback)
  useRealtimeChat(conversationId, {
    onNewMessage: (msg: MessageRow) => {
      markAsRead(msg.id);
    },
  });

  // Subscribe to realtime match/meetup updates
  useRealtimeMatchUpdates(matchId);

  // Subscribe to realtime negotiation status changes
  useNegotiationStatus(conversationId);

  const messages = useMemo(
    () => data?.pages.flatMap((page) => page) ?? [],
    [data],
  );

  // Mark as read on mount
  useEffect(() => {
    if (messages.length > 0) {
      markAsRead(messages[0]?.id);
    }
  }, [messages.length > 0]); // eslint-disable-line react-hooks/exhaustive-deps

  // Determine "seen" state: other user's read_at vs our last message
  const lastOwnMessageId = useMemo(() => {
    for (const msg of messages) {
      if (msg.sender_id === user?.id) return msg.id;
    }
    return null;
  }, [messages, user?.id]);

  // Collect all card_offer_response and meetup_response message IDs that reference
  // an original offer/proposal so we know which ones have been responded to
  const respondedOfferIds = useMemo(() => {
    const ids = new Set<string>();
    for (const msg of messages) {
      if (msg.type === 'card_offer_response') {
        const p = msg.payload as unknown as CardOfferResponsePayload | null;
        if (p?.offer_message_id) ids.add(p.offer_message_id);
      }
      if (msg.type === 'meetup_response') {
        const p = msg.payload as unknown as MeetupResponsePayload | null;
        if (p?.proposal_message_id) ids.add(p.proposal_message_id);
      }
    }
    return ids;
  }, [messages]);

  const isBlocked = blockState?.isBlocked ?? false;

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed) return;

    sendTypingStop();
    sendMessage.mutate({
      conversationId,
      type: 'text',
      body: trimmed,
    });
    setText('');
  }, [text, conversationId, sendMessage, sendTypingStop]);

  const handleTextChange = useCallback(
    (value: string) => {
      setText(value);
      if (value.trim()) {
        sendTypingStart();
      } else {
        sendTypingStop();
      }
    },
    [sendTypingStart, sendTypingStop],
  );

  const handleAcceptOffer = useCallback(
    (messageId: string) => {
      sendMessage.mutate({
        conversationId,
        type: 'card_offer_response',
        body: 'Accepted the trade offer',
        payload: {
          offer_message_id: messageId,
          action: 'accepted',
        },
      });
    },
    [conversationId, sendMessage],
  );

  const handleDeclineOffer = useCallback(
    (messageId: string) => {
      sendMessage.mutate({
        conversationId,
        type: 'card_offer_response',
        body: 'Declined the trade offer',
        payload: {
          offer_message_id: messageId,
          action: 'declined',
        },
      });
    },
    [conversationId, sendMessage],
  );

  const handleCounterOffer = useCallback(
    (message: MessageWithSender) => {
      const payload = message.payload as unknown as CardOfferPayload | null;
      if (payload && onOpenCounterOffer) {
        // Swap offering and requesting for the counter
        onOpenCounterOffer({
          ...payload,
          offering: payload.requesting,
          requesting: payload.offering,
        });
      }
    },
    [onOpenCounterOffer],
  );

  const handleAcceptMeetup = useCallback(
    (messageId: string) => {
      sendMessage.mutate({
        conversationId,
        type: 'meetup_response',
        body: 'Accepted the meetup proposal',
        payload: {
          proposal_message_id: messageId,
          action: 'accepted',
        },
      });
    },
    [conversationId, sendMessage],
  );

  const handleDeclineMeetup = useCallback(
    (messageId: string) => {
      sendMessage.mutate({
        conversationId,
        type: 'meetup_response',
        body: 'Declined the meetup proposal',
        payload: {
          proposal_message_id: messageId,
          action: 'declined',
        },
      });
    },
    [conversationId, sendMessage],
  );

  const handleOfferCardPress = useCallback(
    (card: CardRef) => {
      router.push({
        pathname: '/(tabs)/(listings)/listing-card-detail',
        params: {
          cardExternalId: card.externalId,
          cardName: card.name,
          cardImageUrl: card.imageUrl,
          tcg: card.tcg,
          condition: (card.condition as string) ?? '',
        },
      });
    },
    [router],
  );

  const renderMessage = useCallback(
    ({ item }: { item: MessageWithSender }) => {
      const isOwn = item.sender_id === user?.id;
      const isLastOwn = item.id === lastOwnMessageId;

      const messageContent = (() => {
        switch (item.type) {
          case 'text':
            return (
              <MessageBubble
                message={item}
                isOwnMessage={isOwn}
                isLastOwnMessage={isLastOwn}
                isSeen={false} // TODO: wire to conversation_reads when subscribed
              />
            );

          case 'image':
            return (
              <View
                className={cn(
                  'mb-2 max-w-[75%] px-3',
                  isOwn ? 'self-end' : 'self-start',
                )}
              >
                <Image
                  source={{
                    uri:
                      (item.payload as { url?: string } | null)?.url ??
                      item.body ??
                      '',
                  }}
                  className="h-48 w-48 rounded-xl"
                  resizeMode="cover"
                />
              </View>
            );

          case 'card_offer':
            return (
              <OfferCard
                message={item}
                isOwnMessage={isOwn}
                hasResponse={respondedOfferIds.has(item.id)}
                onAccept={() => handleAcceptOffer(item.id)}
                onDecline={() => handleDeclineOffer(item.id)}
                onCounter={() => handleCounterOffer(item)}
                onCardPress={handleOfferCardPress}
              />
            );

          case 'card_offer_response': {
            const action = (
              item.payload as unknown as CardOfferResponsePayload | null
            )?.action;
            return (
              <SystemMessage
                body={
                  isOwn
                    ? `You ${action} the trade offer`
                    : `${otherUser.name} ${action} the trade offer`
                }
              />
            );
          }

          case 'meetup_proposal':
            return (
              <MeetupProposalCard
                message={item}
                isOwnMessage={isOwn}
                hasResponse={respondedOfferIds.has(item.id)}
                onAccept={() => handleAcceptMeetup(item.id)}
                onDecline={() => handleDeclineMeetup(item.id)}
                conversationId={conversationId}
              />
            );

          case 'meetup_response': {
            const action = (
              item.payload as unknown as MeetupResponsePayload | null
            )?.action;
            return (
              <SystemMessage
                body={
                  isOwn
                    ? `You ${action} the meetup proposal`
                    : `${otherUser.name} ${action} the meetup proposal`
                }
              />
            );
          }

          case 'system':
            return (
              <SystemMessage body={item.body ?? 'System notification'} />
            );

          default:
            return null;
        }
      })();

      return (
        <Pressable
          onLongPress={() => handleLongPress(item)}
          delayLongPress={500}
        >
          {messageContent}
        </Pressable>
      );
    },
    [
      user?.id,
      otherUser.name,
      lastOwnMessageId,
      respondedOfferIds,
      handleAcceptOffer,
      handleDeclineOffer,
      handleCounterOffer,
      handleAcceptMeetup,
      handleDeclineMeetup,
      handleOfferCardPress,
      handleLongPress,
    ],
  );

  const otherInitials = (otherUser.name || 'U')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const isCurrentUserListingOwner =
    tradeContext?.listingOwnerId === user?.id;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-border px-4 py-3">
        <View className="flex-1 flex-row items-center gap-2">
          <Pressable
            onPress={() => router.back()}
            className="-ml-1 p-1 active:opacity-70"
            hitSlop={8}
          >
            <ChevronLeft size={24} color="#6b7280" />
          </Pressable>
          <Avatar uri={otherUser.avatar} fallback={otherInitials} size="md" />
          <Text
            className="flex-shrink text-lg font-semibold text-foreground"
            numberOfLines={1}
          >
            {displayName}
          </Text>
        </View>
        <ChatHeaderActions
          otherUserId={otherUser.id}
          otherUserName={otherUser.name}
          conversationId={conversationId}
          currentDisplayName={displayName}
          onRename={rename}
        />
      </View>

      {/* Trade context header */}
      {tradeContext && (
        <TradeContextHeader
          tradeContext={tradeContext}
          isCurrentUserListingOwner={isCurrentUserListingOwner}
          conversationId={conversationId}
        />
      )}

      {/* Messages */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          inverted
          contentContainerClassName="py-3"
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator className="py-4" />
            ) : null
          }
        />
      )}

      {/* Typing indicator */}
      <TypingIndicator
        isVisible={isOtherUserTyping}
        userName={otherUser.name}
      />

      {/* Blocked banner */}
      {isBlocked ? (
        <View className="flex-row items-center justify-center gap-2 border-t border-border bg-destructive/10 px-4 py-4">
          <Ban size={16} color="#ef4444" />
          <Text className="text-sm font-medium text-destructive">
            {blockState?.blockedByMe
              ? 'You blocked this user'
              : 'This user has blocked you'}
          </Text>
        </View>
      ) : (
        <>
          {/* Dev actions (dev mode only) */}
          {__DEV__ && (
            <DevChatActions
              conversationId={conversationId}
              otherUserId={otherUser.id}
              matchId={matchId}
            />
          )}

          {/* Toolbar */}
          <View className="flex-row border-t border-border px-4 py-1.5">
            <Pressable
              onPress={onOpenOfferModal}
              className="flex-row items-center gap-1 rounded-full bg-accent px-3 py-1.5 active:opacity-70"
            >
              <Handshake size={14} color="#6b7280" />
              <Text className="text-xs font-medium text-muted-foreground">
                Make Offer
              </Text>
            </Pressable>
            <Pressable
              onPress={onOpenMeetupModal}
              className="ml-2 flex-row items-center gap-1 rounded-full bg-accent px-3 py-1.5 active:opacity-70"
            >
              <MapPin size={14} color="#6b7280" />
              <Text className="text-xs font-medium text-muted-foreground">
                Plan Meetup
              </Text>
            </Pressable>
          </View>

          {/* Input bar */}
          <View className="flex-row items-end gap-2 border-t border-border px-4 py-2">
            <TextInput
              value={text}
              onChangeText={handleTextChange}
              placeholder="Type a message..."
              placeholderTextColor="#9ca3af"
              multiline
              className="max-h-24 flex-1 rounded-2xl border border-input bg-background px-4 py-2.5 text-base text-foreground"
              onSubmitEditing={handleSend}
              blurOnSubmit={false}
              onBlur={sendTypingStop}
            />
            <Pressable
              onPress={handleSend}
              disabled={!text.trim() || sendMessage.isPending}
              className={cn(
                'mb-0.5 items-center justify-center rounded-full p-2.5',
                text.trim() ? 'bg-primary' : 'bg-muted',
              )}
            >
              <Send
                size={18}
                color={text.trim() ? '#ffffff' : '#9ca3af'}
              />
            </Pressable>
          </View>
        </>
      )}

      {/* Report modal from long-press */}
      <ReportModal
        visible={!!reportTarget}
        onClose={clearReportTarget}
        reportedUserId={reportTarget?.userId ?? ''}
        reportedMessageId={reportTarget?.messageId}
      />
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatThread;
