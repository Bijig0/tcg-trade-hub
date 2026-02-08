import React, { useCallback } from 'react';
import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { List, Layers } from 'lucide-react-native';

import { useFeedStore } from '@/stores/feedStore/feedStore';
import FilterBar from '../FilterBar/FilterBar';
import FeedListView from '../FeedListView/FeedListView';
import FeedSwipeView from '../FeedSwipeView/FeedSwipeView';

export type FeedScreenProps = {
  /** Whether the current user has any active listings */
  hasActiveListings?: boolean;
};

/**
 * Main feed screen.
 *
 * Header with filter bar (TCG, listing type, condition, sort) and a view mode
 * toggle button (list/swipe). Conditionally renders FeedListView or
 * FeedSwipeView based on useFeedStore viewMode. Shows a first-time banner if
 * the user has no active listings.
 */
const FeedScreen = ({ hasActiveListings = true }: FeedScreenProps) => {
  const viewMode = useFeedStore((s) => s.viewMode);
  const setViewMode = useFeedStore((s) => s.setViewMode);

  const toggleViewMode = useCallback(() => {
    setViewMode(viewMode === 'list' ? 'swipe' : 'list');
  }, [viewMode, setViewMode]);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-border px-4 pb-2 pt-2">
        <Text className="text-xl font-bold text-foreground">Feed</Text>

        <Pressable
          onPress={toggleViewMode}
          className="flex-row items-center gap-1.5 rounded-lg bg-muted px-3 py-1.5 active:bg-accent"
        >
          {viewMode === 'list' ? (
            <Layers size={16} className="text-foreground" />
          ) : (
            <List size={16} className="text-foreground" />
          )}
          <Text className="text-xs font-medium text-foreground">
            {viewMode === 'list' ? 'Swipe' : 'List'}
          </Text>
        </Pressable>
      </View>

      {/* First-time banner */}
      {!hasActiveListings && (
        <View className="mx-4 mt-3 rounded-lg border border-primary/30 bg-primary/10 px-4 py-3">
          <Text className="text-sm font-medium text-foreground">
            Welcome to TCG Trade Hub!
          </Text>
          <Text className="mt-1 text-xs text-muted-foreground">
            Create your first listing to start matching with local traders.
          </Text>
        </View>
      )}

      {/* Filter bar */}
      <FilterBar />

      {/* Feed content */}
      <View className="flex-1">
        {viewMode === 'list' ? <FeedListView /> : <FeedSwipeView />}
      </View>
    </SafeAreaView>
  );
};

export default FeedScreen;
