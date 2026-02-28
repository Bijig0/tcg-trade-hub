import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { List, Heart } from 'lucide-react-native';
import { cn } from '@/lib/cn';

import { useFeedStore } from '@/stores/feedStore/feedStore';
import FeedSwipeView from '../FeedSwipeView/FeedSwipeView';
import SearchBar from '../SearchBar/SearchBar';

/**
 * Discover tab screen — the app's primary landing tab.
 *
 * Has a search bar for card name search, [Buying]/[Trading] intent pills,
 * and the swipe-based FeedSwipeView.
 */
const DiscoverScreen = () => {
  const router = useRouter();
  const wantToBuy = useFeedStore((s) => s.filters.wantToBuy);
  const wantToTrade = useFeedStore((s) => s.filters.wantToTrade);
  const toggleWantToBuy = useFeedStore((s) => s.toggleWantToBuy);
  const toggleWantToTrade = useFeedStore((s) => s.toggleWantToTrade);

  const hasActiveFilters = wantToBuy || wantToTrade;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-border px-4 pb-2 pt-2">
        <Text className="text-xl font-bold text-foreground">Discover</Text>

        <View className="flex-row items-center gap-2">
          <Pressable
            onPress={() => router.push({ pathname: '/(tabs)/(listings)', params: { section: 'interested' } })}
            className="items-center justify-center rounded-lg bg-muted p-1.5 active:bg-accent"
          >
            <Heart size={16} className="text-foreground" />
          </Pressable>

          <Pressable
            onPress={() => router.push('/(tabs)/(discover)/browse')}
            className="flex-row items-center gap-1.5 rounded-lg bg-muted px-3 py-1.5 active:bg-accent"
          >
            <List size={16} className="text-foreground" />
            <Text className="text-xs font-medium text-foreground">Browse</Text>
          </Pressable>
        </View>
      </View>

      {/* Search bar */}
      <View className="py-2">
        <SearchBar />
      </View>

      {/* Intent filter pills */}
      <View className="flex-row items-center gap-2 px-4 pb-2">
        <Pressable
          onPress={toggleWantToBuy}
          className={cn(
            'rounded-full border px-3 py-1',
            wantToBuy
              ? 'border-primary bg-primary'
              : 'border-border bg-card',
          )}
        >
          <Text
            className={cn(
              'text-xs font-medium',
              wantToBuy ? 'text-primary-foreground' : 'text-foreground',
            )}
          >
            Buying
          </Text>
        </Pressable>

        <Pressable
          onPress={toggleWantToTrade}
          className={cn(
            'rounded-full border px-3 py-1',
            wantToTrade
              ? 'border-primary bg-primary'
              : 'border-border bg-card',
          )}
        >
          <Text
            className={cn(
              'text-xs font-medium',
              wantToTrade ? 'text-primary-foreground' : 'text-foreground',
            )}
          >
            Trading
          </Text>
        </Pressable>

        {hasActiveFilters && (
          <Pressable
            onPress={() => {
              const store = useFeedStore.getState();
              if (store.filters.wantToBuy) store.toggleWantToBuy();
              if (store.filters.wantToTrade) store.toggleWantToTrade();
            }}
            className="px-1"
          >
            <Text className="text-xs text-muted-foreground">Clear</Text>
          </Pressable>
        )}
      </View>

      {/* Swipe view */}
      <FeedSwipeView className="flex-1" />
    </SafeAreaView>
  );
};

export default DiscoverScreen;
