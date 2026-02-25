import React from 'react';
import { Text } from 'react-native';

export type ReadReceiptProps = {
  isLastOwnMessage: boolean;
  isSeen: boolean;
};

/** Small "Seen" indicator below the user's last outgoing message. */
const ReadReceipt = ({ isLastOwnMessage, isSeen }: ReadReceiptProps) => {
  if (!isLastOwnMessage || !isSeen) return null;

  return (
    <Text className="mr-3 mt-0.5 text-right text-[10px] text-muted-foreground">
      Seen
    </Text>
  );
};

export default ReadReceipt;
