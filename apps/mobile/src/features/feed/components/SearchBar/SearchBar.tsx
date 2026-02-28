import React, { useState, useCallback, useRef } from 'react';
import { View, TextInput, Pressable } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { useFeedStore } from '@/stores/feedStore/feedStore';

const DEBOUNCE_MS = 300;

/**
 * Debounced search bar for card name search in the feed.
 * Updates feedStore.searchQuery after 300ms of inactivity.
 */
const SearchBar = () => {
  const setSearchQuery = useFeedStore((s) => s.setSearchQuery);
  const [localQuery, setLocalQuery] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = useCallback(
    (text: string) => {
      setLocalQuery(text);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setSearchQuery(text.trim());
      }, DEBOUNCE_MS);
    },
    [setSearchQuery],
  );

  const handleClear = useCallback(() => {
    setLocalQuery('');
    setSearchQuery('');
    if (timerRef.current) clearTimeout(timerRef.current);
  }, [setSearchQuery]);

  return (
    <View className="mx-4 flex-row items-center rounded-xl border border-border bg-card px-3 py-2.5">
      <Search size={18} className="text-muted-foreground" />
      <TextInput
        value={localQuery}
        onChangeText={handleChange}
        placeholder="Search cards..."
        className="ml-2 flex-1 text-sm text-foreground"
        placeholderTextColor="#a1a1aa"
        returnKeyType="search"
        autoCorrect={false}
      />
      {localQuery.length > 0 && (
        <Pressable onPress={handleClear} hitSlop={8}>
          <X size={16} className="text-muted-foreground" />
        </Pressable>
      )}
    </View>
  );
};

export default SearchBar;
