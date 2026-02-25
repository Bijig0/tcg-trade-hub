import React from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { List, Layers, Heart } from 'lucide-react-native';
import { cn } from '@/lib/cn';

import usePrefetchTabs from '@/hooks/usePrefetchTabs/usePrefetchTabs';
import EmptyState from '@/components/ui/EmptyState/EmptyState';
import { useFeedStore } from '@/stores/feedStore/feedStore';
import useHasActiveListings from '../../hooks/useHasActiveListings/useHasActiveListings';
import FeedSwipeView from '../FeedSwipeView/FeedSwipeView';
import type { ListingType } from '@tcg-trade-hub/database';

const TYPE_CHIPS: { label: string; value: ListingType }[] = [
  { label: 'WTS', value: 'wts' },
  { label: 'WTB', value: 'wtb' },
  { label: 'WTT', value: 'wtt' },
];

/**
 * Discover tab screen — the app's primary landing tab.
 *
 * Gates access behind having at least one active listing. If the user has
 * none, shows an EmptyState with a CTA to create one. Otherwise renders
 * the swipe-based FeedSwipeView with a header linking to the Browse screen.
 */
const DiscoverScreen = () => {
  const router = useRouter();
  const { hasListings, isLoading } = useHasActiveListings();
  const listingTypes = useFeedStore((s) => s.filters.listingTypes);
  const toggleListingType = useFeedStore((s) => s.toggleListingType);
  usePrefetchTabs();

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background" edges={['top']}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  if (!hasListings) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        <EmptyState
          icon={<EmptyIcon />}
          title="Create a Listing First"
          description="To discover other traders, you need at least one active listing so they can see what you're offering."
          action={{
            label: 'Create Listing',
            onPress: () => router.push('/(tabs)/(listings)/new'),
          }}
        />
      </SafeAreaView>
    );
  }

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

      {/* Type filter chips */}
      <View className="flex-row items-center gap-2 px-4 py-2">
        {TYPE_CHIPS.map((chip) => {
          const active = listingTypes.includes(chip.value);
          return (
            <Pressable
              key={chip.value}
              onPress={() => toggleListingType(chip.value)}
              className={cn(
                'rounded-full border px-3 py-1',
                active
                  ? 'border-primary bg-primary'
                  : 'border-border bg-card',
              )}
            >
              <Text
                className={cn(
                  'text-xs font-medium',
                  active ? 'text-primary-foreground' : 'text-foreground',
                )}
              >
                {chip.label}
              </Text>
            </Pressable>
          );
        })}
        {listingTypes.length > 0 && (
          <Pressable
            onPress={() => useFeedStore.getState().setFilter('listingTypes', [])}
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

const EmptyIcon = () => (
  <View className="h-16 w-16 items-center justify-center rounded-full bg-primary/10">
    <Layers size={32} className="text-primary" />
  </View>
);

export default DiscoverScreen;
