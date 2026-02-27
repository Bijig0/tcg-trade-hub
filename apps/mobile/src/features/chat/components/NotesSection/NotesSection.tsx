import React, { useState, useRef } from 'react';
import { View, Text, Pressable, TextInput, Animated } from 'react-native';
import { ChevronDown, Send } from 'lucide-react-native';
import Avatar from '@/components/ui/Avatar/Avatar';
import type { NoteEntry } from '@tcg-trade-hub/database';

export type NotesSectionProps = {
  notes: NoteEntry[];
  isEditable?: boolean;
  onAddNote?: (text: string) => void;
  currentUserId?: string;
};

/**
 * Collapsible notes list with author attribution and an "add note" input.
 * Expanded by default when 0-2 notes, collapsed when 3+.
 */
const NotesSection = ({
  notes,
  isEditable,
  onAddNote,
  currentUserId,
}: NotesSectionProps) => {
  const [inputText, setInputText] = useState('');
  const defaultExpanded = notes.length <= 2;
  const [expanded, setExpanded] = useState(defaultExpanded);
  const rotateAnim = useRef(new Animated.Value(defaultExpanded ? 1 : 0)).current;

  const toggle = () => {
    const toExpanded = !expanded;
    setExpanded(toExpanded);
    Animated.timing(rotateAnim, {
      toValue: toExpanded ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const handleSubmit = () => {
    const trimmed = inputText.trim();
    if (!trimmed || !onAddNote) return;
    onAddNote(trimmed);
    setInputText('');
  };

  // When no notes and not editable, render nothing
  if (notes.length === 0 && !isEditable) return null;

  // When no notes but editable, show just the input (no collapse header)
  if (notes.length === 0 && isEditable && onAddNote) {
    return (
      <View className="mx-4 mb-3">
        <View className="flex-row items-center gap-2">
          <TextInput
            className="min-h-[36px] flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
            value={inputText}
            onChangeText={setInputText}
            placeholder="Write a note..."
            placeholderTextColor="#9ca3af"
            maxLength={500}
            onSubmitEditing={handleSubmit}
            returnKeyType="send"
          />
          <Pressable
            onPress={handleSubmit}
            disabled={!inputText.trim()}
            className="rounded-full bg-primary p-2 active:opacity-70 disabled:opacity-40"
            hitSlop={6}
          >
            <Send size={14} color="#fff" />
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View className="mx-4 mb-3">
      {/* Header — tap to toggle */}
      <Pressable
        onPress={toggle}
        className="flex-row items-center justify-between py-1"
        hitSlop={4}
      >
        <Text className="text-xs font-semibold uppercase text-muted-foreground">
          Notes ({notes.length})
        </Text>
        <Animated.View style={{ transform: [{ rotate: rotation }] }}>
          <ChevronDown size={14} color="#9ca3af" />
        </Animated.View>
      </Pressable>

      {/* Expanded body */}
      {expanded && (
        <View className="mt-1 gap-2">
          {notes.map((note, i) => {
            const isOwn = currentUserId != null && note.author_id === currentUserId;
            return (
              <View
                key={`${note.author_id}-${note.created_at}-${i}`}
                className={`flex-row items-start gap-2 rounded-lg px-2 py-1.5 ${isOwn ? 'bg-primary/5' : ''}`}
              >
                <Avatar
                  uri={note.author_avatar_url}
                  fallback={note.author_name.slice(0, 2).toUpperCase()}
                  size="sm"
                />
                <View className="flex-1">
                  <Text className="text-xs font-medium text-foreground">
                    {note.author_name}
                  </Text>
                  <Text className="text-sm text-foreground">{note.text}</Text>
                </View>
              </View>
            );
          })}

          {/* Add note input (editable mode only) */}
          {isEditable && onAddNote && (
            <View className="mt-1 flex-row items-center gap-2">
              <TextInput
                className="min-h-[36px] flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                value={inputText}
                onChangeText={setInputText}
                placeholder="Write a note..."
                placeholderTextColor="#9ca3af"
                maxLength={500}
                onSubmitEditing={handleSubmit}
                returnKeyType="send"
              />
              <Pressable
                onPress={handleSubmit}
                disabled={!inputText.trim()}
                className="rounded-full bg-primary p-2 active:opacity-70 disabled:opacity-40"
                hitSlop={6}
              >
                <Send size={14} color="#fff" />
              </Pressable>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default NotesSection;
