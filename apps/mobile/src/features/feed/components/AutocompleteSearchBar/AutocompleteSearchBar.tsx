import React, { useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Search, X, ChevronRight } from 'lucide-react-native';
import type { NormalizedCard } from '@tcg-trade-hub/database';
import useAutocompleteSearch from '../../hooks/useAutocompleteSearch/useAutocompleteSearch';
import { useFeedStore } from '@/stores/feedStore/feedStore';

export type AutocompleteSearchBarProps = {
  onCardSelect: (card: NormalizedCard) => void;
};

/**
 * Debounced search bar with autocomplete dropdown showing card previews.
 *
 * Tapping a card result invokes onCardSelect (navigates to Card Detail).
 * "See all results" sets the feedStore searchQuery for ILIKE fallback.
 */
const AutocompleteSearchBar = ({ onCardSelect }: AutocompleteSearchBarProps) => {
  const setSearchQuery = useFeedStore((s) => s.setSearchQuery);
  const {
    query,
    setQuery,
    clearQuery,
    isDropdownOpen,
    setIsDropdownOpen,
    previewResults,
    hasMore,
    isLoading,
    totalResults,
  } = useAutocompleteSearch();

  const handleSeeAll = useCallback(() => {
    setSearchQuery(query.trim());
    setIsDropdownOpen(false);
  }, [query, setSearchQuery, setIsDropdownOpen]);

  const handleCardPress = useCallback(
    (card: NormalizedCard) => {
      setIsDropdownOpen(false);
      onCardSelect(card);
    },
    [onCardSelect, setIsDropdownOpen],
  );

  const handleFocus = useCallback(() => {
    if (query.trim().length >= 2) {
      setIsDropdownOpen(true);
    }
  }, [query, setIsDropdownOpen]);

  const handleBlur = useCallback(() => {
    // Delay close to allow press events on dropdown to register
    setTimeout(() => setIsDropdownOpen(false), 200);
  }, [setIsDropdownOpen]);

  const formatPrice = (price: number | null): string => {
    if (price === null) return '';
    return `$${price.toFixed(2)}`;
  };

  return (
    <View className="relative z-50">
      {/* Search input */}
      <View className="mx-4 flex-row items-center rounded-xl border border-border bg-card px-3 py-3">
        <Search size={18} className="text-muted-foreground" />
        <TextInput
          value={query}
          onChangeText={setQuery}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="Search cards..."
          className="ml-2 flex-1 text-sm text-foreground"
          style={{ padding: 0, height: 18, textAlignVertical: 'center' }}
          placeholderTextColor="#a1a1aa"
          returnKeyType="search"
          autoCorrect={false}
        />
        {isLoading && <ActivityIndicator size="small" className="mr-1" />}
        {query.length > 0 && (
          <Pressable onPress={clearQuery} hitSlop={8}>
            <X size={16} className="text-muted-foreground" />
          </Pressable>
        )}
      </View>

      {/* Dropdown */}
      {isDropdownOpen && !isLoading && query.trim().length >= 2 && (
        <View
          className="absolute left-4 right-4 top-12 z-50 rounded-xl border border-border bg-card shadow-lg"
          style={{ elevation: 10 }}
        >
          {previewResults.length === 0 ? (
            <View className="items-center px-3 py-4">
              <Text className="text-sm text-muted-foreground">
                No cards found for "{query.trim()}"
              </Text>
            </View>
          ) : (
            <>
              {previewResults.map((card) => (
                <Pressable
                  key={card.externalId}
                  onPress={() => handleCardPress(card)}
                  className="flex-row items-center border-b border-border px-3 py-2.5 active:bg-accent"
                >
                  <Image
                    source={{ uri: card.imageUrl }}
                    className="h-14 w-10 rounded"
                    resizeMode="cover"
                  />
                  <View className="ml-3 flex-1">
                    <Text
                      className="text-sm font-semibold text-foreground"
                      numberOfLines={1}
                    >
                      {card.name}
                    </Text>
                    <Text
                      className="text-xs text-muted-foreground"
                      numberOfLines={1}
                    >
                      {card.setName} · #{card.number}
                    </Text>
                    <View className="mt-0.5 flex-row items-center gap-2">
                      <Text className="text-xs text-muted-foreground">
                        {card.rarity}
                      </Text>
                      {card.marketPrice !== null && (
                        <Text className="text-xs font-medium text-foreground">
                          {formatPrice(card.marketPrice)}
                        </Text>
                      )}
                    </View>
                  </View>
                </Pressable>
              ))}

              {hasMore && (
                <Pressable
                  onPress={handleSeeAll}
                  className="flex-row items-center justify-center px-3 py-3 active:bg-accent"
                >
                  <Text className="text-sm font-medium text-primary">
                    See all results for "{query.trim()}"
                  </Text>
                  <ChevronRight size={14} className="ml-1 text-primary" />
                </Pressable>
              )}
            </>
          )}
        </View>
      )}
    </View>
  );
};

export default AutocompleteSearchBar;
