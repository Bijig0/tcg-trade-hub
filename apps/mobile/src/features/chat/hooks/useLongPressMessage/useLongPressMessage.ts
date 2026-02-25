import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import type { MessageRow } from '@tcg-trade-hub/database';

export type ReportTarget = {
  userId: string;
  messageId: string;
} | null;

/**
 * Handles long-press on a message: shows an action sheet with
 * "Copy Text" (for text messages) and "Report Message" (for other user's messages).
 */
const useLongPressMessage = (currentUserId: string | undefined) => {
  const [reportTarget, setReportTarget] = useState<ReportTarget>(null);

  const clearReportTarget = useCallback(() => {
    setReportTarget(null);
  }, []);

  const handleLongPress = useCallback(
    (message: MessageRow) => {
      const isOwn = message.sender_id === currentUserId;
      const isText = message.type === 'text';

      const buttons: Array<{
        text: string;
        onPress?: () => void;
        style?: 'cancel' | 'destructive' | 'default';
      }> = [];

      if (isText && message.body) {
        buttons.push({
          text: 'Copy Text',
          onPress: () => {
            Clipboard.setStringAsync(message.body ?? '');
          },
        });
      }

      if (!isOwn) {
        buttons.push({
          text: 'Report Message',
          style: 'destructive',
          onPress: () => {
            setReportTarget({
              userId: message.sender_id,
              messageId: message.id,
            });
          },
        });
      }

      buttons.push({ text: 'Cancel', style: 'cancel' });

      if (buttons.length <= 1) return; // Only cancel — nothing to show

      Alert.alert('Message', undefined, buttons);
    },
    [currentUserId],
  );

  return { handleLongPress, reportTarget, clearReportTarget };
};

export default useLongPressMessage;
