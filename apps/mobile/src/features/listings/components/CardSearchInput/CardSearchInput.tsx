import React, { useState, useCallback, useRef } from 'react';
import { View, Text, Image, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { cn } from '@/lib/cn';
import Input from '@/components/ui/Input/Input';
import useCardSearch from '../../hooks/useCardSearch/useCardSearch';
import type { TcgType, NormalizedCard } from '@tcg-trade-hub/database';

export type CardSearchInputProps = {
  tcg: TcgType | null;
  onSelect: (card: NormalizedCard) => void;
  className?: string;
};

const DEBOUNCE_MS = 400;

/**
 * Text input with autocomplete dropdown for card search.
 *
 * Calls useCardSearch with a debounced query value. Shows results as a list
 * below with card image thumbnails + name + set. Selecting a card calls the
 * onSelect prop.
 */
const CardSearchInput = ({ tcg, onSelect, className }: CardSearchInputProps) => {
  const [inputValue, setInputValue] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: results, isLoading } = useCardSearch({
    tcg,
    query: debouncedQuery,
  });

  const handleChangeText = useCallback(
    (text: string) => {
      setInputValue(text);
      setShowResults(true);

      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      debounceTimer.current = setTimeout(() => {
        setDebouncedQuery(text);
      }, DEBOUNCE_MS);
    },
    [],
  );

  const handleSelect = useCallback(
    (card: NormalizedCard) => {
      setInputValue(card.name);
      setShowResults(false);
      onSelect(card);
    },
    [onSelect],
  );

  const renderResult = (item: NormalizedCard) => (
    <Pressable
      key={`${item.tcg}-${item.externalId}`}
      onPress={() => handleSelect(item)}
      className="flex-row items-center gap-3 px-3 py-2 active:bg-accent"
    >
      <Image
        source={{ uri: item.imageUrl }}
        className="h-12 w-8 rounded bg-muted"
        resizeMode="cover"
      />
      <View className="flex-1">
        <Text className="text-sm font-medium text-foreground" numberOfLines={1}>
          {item.name}
        </Text>
        <Text className="text-xs text-muted-foreground" numberOfLines={1}>
          {item.setName} &middot; #{item.number}
        </Text>
      </View>
      {item.marketPrice != null && (
        <Text className="text-xs text-muted-foreground">
          ${item.marketPrice.toFixed(2)}
        </Text>
      )}
    </Pressable>
  );

  return (
    <View className={cn('relative', className)}>
      <Input
        label="Search Card"
        placeholder={tcg ? `Search ${tcg} cards...` : 'Select a TCG first'}
        value={inputValue}
        onChangeText={handleChangeText}
        onFocus={() => setShowResults(true)}
        editable={!!tcg}
      />

      {showResults && debouncedQuery.length >= 2 && (
        <View className="absolute left-0 right-0 top-[72px] z-50 max-h-64 rounded-lg border border-border bg-card shadow-lg">
          {isLoading ? (
            <View className="items-center py-4">
              <ActivityIndicator />
              <Text className="mt-2 text-xs text-muted-foreground">Searching cards...</Text>
            </View>
          ) : results && results.length > 0 ? (
            <ScrollView keyboardShouldPersistTaps="handled" nestedScrollEnabled>
              {results.map((item, index) => (
                <React.Fragment key={`${item.tcg}-${item.externalId}`}>
                  {index > 0 && <View className="h-px bg-border" />}
                  {renderResult(item)}
                </React.Fragment>
              ))}
            </ScrollView>
          ) : (
            <View className="items-center py-4">
              <Text className="text-sm text-muted-foreground">No cards found</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default CardSearchInput;
