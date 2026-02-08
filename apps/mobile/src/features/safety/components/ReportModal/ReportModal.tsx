import React, { useState } from 'react';
import { View, Text, Modal, Pressable, TextInput } from 'react-native';
import Button from '@/components/ui/Button/Button';
import Select from '@/components/ui/Select/Select';
import useReportUser from '../../hooks/useReportUser/useReportUser';
import type { ReportCategory } from '@tcg-trade-hub/database';

export type ReportModalProps = {
  visible: boolean;
  onClose: () => void;
  reportedUserId: string;
  reportedMessageId?: string | null;
};

const REPORT_CATEGORIES: Array<{ label: string; value: ReportCategory }> = [
  { label: 'Inappropriate Content', value: 'inappropriate_content' },
  { label: 'Scam', value: 'scam' },
  { label: 'Counterfeit Cards', value: 'counterfeit' },
  { label: 'No Show', value: 'no_show' },
  { label: 'Harassment', value: 'harassment' },
  { label: 'Other', value: 'other' },
];

/**
 * Modal for reporting a user with a category select and description input.
 * Submits to the reports table via the useReportUser hook.
 */
const ReportModal = ({
  visible,
  onClose,
  reportedUserId,
  reportedMessageId,
}: ReportModalProps) => {
  const [category, setCategory] = useState<string>('');
  const [description, setDescription] = useState('');
  const reportUser = useReportUser();

  const handleSubmit = () => {
    if (!category) return;

    reportUser.mutate(
      {
        reportedUserId,
        reportedMessageId: reportedMessageId ?? null,
        category: category as ReportCategory,
        description: description.trim() || null,
      },
      {
        onSuccess: () => {
          setCategory('');
          setDescription('');
          onClose();
        },
      },
    );
  };

  const handleClose = () => {
    setCategory('');
    setDescription('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <Pressable
        onPress={handleClose}
        className="flex-1 items-center justify-center bg-black/50"
      >
        <Pressable
          onPress={() => {}}
          className="mx-6 w-[85%] rounded-xl border border-border bg-card p-6"
        >
          <Text className="mb-4 text-center text-xl font-bold text-card-foreground">
            Report User
          </Text>

          {/* Category select */}
          <View className="mb-4">
            <Select
              label="Category"
              placeholder="Select a reason..."
              value={category}
              onValueChange={setCategory}
              options={REPORT_CATEGORIES}
            />
          </View>

          {/* Description input */}
          <View className="mb-6 gap-1.5">
            <Text className="text-sm font-medium text-foreground">
              Description (optional)
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Provide additional details..."
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={3}
              className="min-h-[80px] rounded-lg border border-input bg-background p-3 text-base text-foreground"
              textAlignVertical="top"
            />
          </View>

          {/* Actions */}
          <View className="gap-3">
            <Button
              onPress={handleSubmit}
              disabled={!category || reportUser.isPending}
            >
              <Text className="text-base font-semibold text-primary-foreground">
                {reportUser.isPending ? 'Submitting...' : 'Submit Report'}
              </Text>
            </Button>

            <Button variant="ghost" onPress={handleClose}>
              <Text className="text-base font-medium text-muted-foreground">Cancel</Text>
            </Button>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default ReportModal;
