import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Modal, Pressable, KeyboardAvoidingView, Platform } from 'react-native';

export type RenameChatModalProps = {
  visible: boolean;
  currentName: string;
  onSave: (newName: string) => void;
  onClose: () => void;
};

/**
 * Cross-platform modal for renaming a conversation.
 * TextInput with 1–100 char validation, Save + Cancel buttons.
 */
const RenameChatModal = ({
  visible,
  currentName,
  onSave,
  onClose,
}: RenameChatModalProps) => {
  const [value, setValue] = useState(currentName);

  useEffect(() => {
    if (visible) {
      setValue(currentName);
    }
  }, [visible, currentName]);

  const trimmed = value.trim();
  const isValid = trimmed.length >= 1 && trimmed.length <= 100;

  const handleSave = () => {
    if (!isValid) return;
    onSave(trimmed);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <Pressable
          onPress={onClose}
          className="flex-1 items-center justify-center bg-black/50 px-6"
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl bg-card p-5"
          >
            <Text className="mb-4 text-lg font-semibold text-card-foreground">
              Rename Chat
            </Text>

            <TextInput
              value={value}
              onChangeText={setValue}
              maxLength={100}
              placeholder="Enter chat name"
              placeholderTextColor="#9ca3af"
              autoFocus
              className="rounded-lg border border-input bg-background px-3 py-2.5 text-base text-foreground"
              onSubmitEditing={handleSave}
              returnKeyType="done"
            />

            <Text className="mt-1.5 text-xs text-muted-foreground">
              {trimmed.length}/100 characters
            </Text>

            <View className="mt-4 flex-row justify-end gap-3">
              <Pressable
                onPress={onClose}
                className="rounded-lg px-4 py-2 active:opacity-70"
              >
                <Text className="text-sm font-medium text-muted-foreground">
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                onPress={handleSave}
                disabled={!isValid}
                className="rounded-lg bg-primary px-4 py-2 active:opacity-70 disabled:opacity-50"
              >
                <Text className="text-sm font-medium text-primary-foreground">
                  Save
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default RenameChatModal;
