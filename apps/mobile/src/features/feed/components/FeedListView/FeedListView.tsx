import React from 'react';
import { FlatList, View, ActivityIndicator, type ListRenderItemInfo } from 'react-native';
import { PackageOpen } from 'lucide-react-native';
import Skeleton from '@/components/ui/Skeleton/Skeleton';
import EmptyState from '@/components/ui/EmptyState/EmptyState';
import ListingCard from '../ListingCard/ListingCard';
import useFeedListings from '../../hooks/useFeedListings/useFeedListings';
import type { ListingWithDistance } from '../../schemas';

export type FeedListViewProps = {
  onRefresh?: () => void;
};

/**
 * FlatList-based feed view rendering ListingCard items.
 *
 * Supports infinite scroll via onEndReached, shows a loading skeleton on
 * initial load, and displays an empty state when no results match filters.
 */
const FeedListView = ({ onRefresh }: FeedListViewProps) => {
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    isRefetching,
  } = useFeedListings();

  const listings = data?.pages.flatMap((page) => page.listings) ?? [];

  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const handleRefresh = () => {
    refetch();
    onRefresh?.();
  };

  const renderItem = ({ item }: ListRenderItemInfo<ListingWithDistance>) => (
    <ListingCard listing={item} className="mx-4 mb-3" />
  );

  const keyExtractor = (item: ListingWithDistance) => item.id;

  if (isLoading) {
    return (
      <View className="flex-1 gap-3 px-4 pt-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <View key={`skeleton-${i}`} className="flex-row rounded-xl border border-border bg-card p-3">
            <Skeleton className="h-24 w-16 rounded-lg" />
            <View className="ml-3 flex-1 gap-2">
              <Skeleton className="h-4 w-20 rounded" />
              <Skeleton className="h-5 w-40 rounded" />
              <Skeleton className="h-3 w-24 rounded" />
              <Skeleton className="h-4 w-32 rounded" />
            </View>
          </View>
        ))}
      </View>
    );
  }

  if (listings.length === 0) {
    return (
      <EmptyState
        icon={<PackageOpen size={48} className="text-muted-foreground" />}
        title="No Listings Found"
        description="Try adjusting your filters or check back later for new listings in your area."
      />
    );
  }

  return (
    <FlatList
      data={listings}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.5}
      refreshing={isRefetching}
      onRefresh={handleRefresh}
      contentContainerClassName="pt-3 pb-6"
      ListFooterComponent={
        isFetchingNextPage ? (
          <View className="items-center py-4">
            <ActivityIndicator />
          </View>
        ) : null
      }
    />
  );
};

export default FeedListView;
