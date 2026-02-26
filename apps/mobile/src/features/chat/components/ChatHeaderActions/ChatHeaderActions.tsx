import React, { useCallback, useState } from 'react';
import { Alert, Pressable } from 'react-native';
import { MoreVertical } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import useBlockUser from '@/features/safety/hooks/useBlockUser/useBlockUser';
import ReportModal from '@/features/safety/components/ReportModal/ReportModal';
import RenameChatModal from '../RenameChatModal/RenameChatModal';
import { chatKeys } from '../../queryKeys';

export type ChatHeaderActionsProps = {
  otherUserId: string;
  otherUserName: string;
  conversationId: string;
  currentDisplayName: string;
  onRename: (newName: string) => void;
};

/**
 * 3-dot menu button for the chat header.
 * Shows "Rename Chat", "Block {name}", and "Report {name}" actions.
 */
const ChatHeaderActions = ({
  otherUserId,
  otherUserName,
  conversationId,
  currentDisplayName,
  onRename,
}: ChatHeaderActionsProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const blockUser = useBlockUser();
  const [reportVisible, setReportVisible] = useState(false);
  const [renameVisible, setRenameVisible] = useState(false);

  const handlePress = useCallback(() => {
    Alert.alert('Actions', undefined, [
      {
        text: 'Rename Chat',
        onPress: () => setRenameVisible(true),
      },
      {
        text: `Block ${otherUserName}`,
        style: 'destructive',
        onPress: () => {
          blockUser.blockWithConfirmation({
            blockedId: otherUserId,
            displayName: otherUserName,
          });
          // Navigate back after blocking
          queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
          router.back();
        },
      },
      {
        text: `Report ${otherUserName}`,
        style: 'destructive',
        onPress: () => setReportVisible(true),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }, [otherUserId, otherUserName, blockUser, queryClient, router]);

  return (
    <>
      <Pressable
        onPress={handlePress}
        className="items-center justify-center p-2 active:opacity-70"
        hitSlop={8}
      >
        <MoreVertical size={20} color="#6b7280" />
      </Pressable>

      <ReportModal
        visible={reportVisible}
        onClose={() => setReportVisible(false)}
        reportedUserId={otherUserId}
      />

      <RenameChatModal
        visible={renameVisible}
        currentName={currentDisplayName}
        onSave={onRename}
        onClose={() => setRenameVisible(false)}
      />
    </>
  );
};

export default ChatHeaderActions;
