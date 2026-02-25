import React from 'react';
import { View, Text } from 'react-native';
import { cn } from '@/lib/cn';
import ReadReceipt from '../ReadReceipt/ReadReceipt';
import type { MessageRow } from '@tcg-trade-hub/database';

export type MessageBubbleProps = {
  message: MessageRow;
  isOwnMessage: boolean;
  isLastOwnMessage?: boolean;
  isSeen?: boolean;
  className?: string;
};

/** Standard text chat bubble. Own messages right-aligned in primary, others left in secondary. */
const MessageBubble = ({
  message,
  isOwnMessage,
  isLastOwnMessage = false,
  isSeen = false,
  className,
}: MessageBubbleProps) => {
  const timestamp = new Date(message.created_at).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View
      className={cn(
        'mb-2 max-w-[80%] px-3',
        isOwnMessage ? 'self-end' : 'self-start',
        className,
      )}
    >
      <View
        className={cn(
          'rounded-2xl px-4 py-2.5',
          isOwnMessage ? 'bg-primary' : 'bg-secondary',
        )}
      >
        <Text
          className={cn(
            'text-base',
            isOwnMessage
              ? 'text-primary-foreground'
              : 'text-secondary-foreground',
          )}
        >
          {message.body}
        </Text>
      </View>
      <Text
        className={cn(
          'mt-1 text-[10px] text-muted-foreground',
          isOwnMessage ? 'text-right' : 'text-left',
        )}
      >
        {timestamp}
      </Text>
      <ReadReceipt isLastOwnMessage={isLastOwnMessage} isSeen={isSeen} />
    </View>
  );
};

export default MessageBubble;
