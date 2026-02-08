import React, { useState, useCallback, useMemo } from 'react';
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
import { Send, Handshake, MapPin } from 'lucide-react-native';
import { cn } from '@/lib/cn';
import { useAuth } from '@/context/AuthProvider';
import Avatar from '@/components/ui/Avatar/Avatar';
import useMessages, {
  type MessageWithSender,
} from '../../hooks/useMessages/useMessages';
import useSendMessage from '../../hooks/useSendMessage/useSendMessage';
import useRealtimeChat from '../../hooks/useRealtimeChat/useRealtimeChat';
import MessageBubble from '../MessageBubble/MessageBubble';
import OfferCard from '../OfferCard/OfferCard';
import MeetupProposalCard from '../MeetupProposalCard/MeetupProposalCard';
import SystemMessage from '../SystemMessage/SystemMessage';
import type {
  CardOfferResponsePayload,
  MeetupResponsePayload,
  CardOfferPayload,
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
  const [text, setText] = useState('');
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useMessages(conversationId);
  const sendMessage = useSendMessage();

  // Subscribe to realtime messages
  useRealtimeChat(conversationId);

  const messages = useMemo(
    () => data?.pages.flatMap((page) => page) ?? [],
    [data],
  );

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

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed) return;

    sendMessage.mutate({
      conversationId,
      type: 'text',
      body: trimmed,
    });
    setText('');
  }, [text, conversationId, sendMessage]);

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

  const renderMessage = useCallback(
    ({ item }: { item: MessageWithSender }) => {
      const isOwn = item.sender_id === user?.id;

      switch (item.type) {
        case 'text':
          return <MessageBubble message={item} isOwnMessage={isOwn} />;

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
    },
    [
      user?.id,
      otherUser.name,
      respondedOfferIds,
      handleAcceptOffer,
      handleDeclineOffer,
      handleCounterOffer,
      handleAcceptMeetup,
      handleDeclineMeetup,
    ],
  );

  const otherInitials = otherUser.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background"
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View className="flex-row items-center gap-3 border-b border-border px-4 py-3">
        <Avatar uri={otherUser.avatar} fallback={otherInitials} size="md" />
        <Text className="text-lg font-semibold text-foreground">
          {otherUser.name}
        </Text>
      </View>

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
          onChangeText={setText}
          placeholder="Type a message..."
          placeholderTextColor="#9ca3af"
          multiline
          className="max-h-24 flex-1 rounded-2xl border border-input bg-background px-4 py-2.5 text-base text-foreground"
          onSubmitEditing={handleSend}
          blurOnSubmit={false}
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
    </KeyboardAvoidingView>
  );
};

export default ChatThread;
