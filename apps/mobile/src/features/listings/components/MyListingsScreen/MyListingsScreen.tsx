import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, FlatList, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus, ArrowRight, Package, Handshake, Archive } from 'lucide-react-native';
import SegmentedFilter from '@/components/ui/SegmentedFilter/SegmentedFilter';
import Skeleton from '@/components/ui/Skeleton/Skeleton';
import useMyListings from '../../hooks/useMyListings/useMyListings';
import useDeleteListing from '../../hooks/useDeleteListing/useDeleteListing';
import groupListingsByTab from '../../utils/groupListingsByTab/groupListingsByTab';
import ActiveListingCard from '../ActiveListingCard/ActiveListingCard';
import MatchedListingCard from '../MatchedListingCard/MatchedListingCard';
import HistoryListingCard from '../HistoryListingCard/HistoryListingCard';
import type { MyListingWithMatch, ListingTab } from '../../schemas';
import type { SegmentedFilterItem } from '@/components/ui/SegmentedFilter/SegmentedFilter';

const LISTING_TYPE_DESCRIPTIONS = [
  { type: 'WTS', label: 'Want to Sell', description: 'List cards you want to sell' },
  { type: 'WTB', label: 'Want to Buy', description: 'Post cards you\'re looking for' },
  { type: 'WTT', label: 'Want to Trade', description: 'Find trade partners nearby' },
] as const;

const EMPTY_STATE_CONFIG: Record<ListingTab, { icon: typeof Package; title: string; subtitle: string }> = {
  active: {
    icon: Package,
    title: 'No Active Listings',
    subtitle: 'Tap + to create your first listing.',
  },
  matched: {
    icon: Handshake,
    title: 'No Matches Yet',
    subtitle: 'When someone matches with your listing, it will appear here.',
  },
  history: {
    icon: Archive,
    title: 'No History',
    subtitle: 'Completed and removed listings will show up here.',
  },
};

/**
 * Main listings screen with industry-standard status tabs.
 *
 * Three tabs: Active | Matched | History
 * Each tab shows a flat FlatList of cards with per-card status treatment.
 * First-time empty state (zero total listings) shows onboarding view.
 */
const MyListingsScreen = () => {
  const router = useRouter();
  const { data: listings, isLoading, refetch, isRefetching } = useMyListings();
  const deleteListing = useDeleteListing();
  const [activeTab, setActiveTab] = useState<ListingTab>('active');

  const handleCreatePress = () => {
    router.push('/(tabs)/(listings)/new');
  };

  const handleDeletePress = useCallback(
    (listing: MyListingWithMatch) => {
      Alert.alert(
        'Remove Listing',
        `Are you sure you want to remove "${listing.card_name}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: () => deleteListing.mutate(listing.id),
          },
        ],
      );
    },
    [deleteListing],
  );

  const { groups, counts } = useMemo(
    () => groupListingsByTab(listings ?? []),
    [listings],
  );

  const tabItems: SegmentedFilterItem<ListingTab>[] = useMemo(
    () => [
      { value: 'active', label: 'Active', count: counts.active },
      { value: 'matched', label: 'Matched', count: counts.matched },
      { value: 'history', label: 'History', count: counts.history },
    ],
    [counts],
  );

  const currentData = groups[activeTab];

  const renderItem = useCallback(
    ({ item }: { item: MyListingWithMatch }) => {
      switch (activeTab) {
        case 'active':
          return <ActiveListingCard listing={item} onDelete={handleDeletePress} />;
        case 'matched':
          return <MatchedListingCard listing={item} />;
        case 'history':
          return <HistoryListingCard listing={item} />;
      }
    },
    [activeTab, handleDeletePress],
  );

  const renderEmptyState = () => {
    const config = EMPTY_STATE_CONFIG[activeTab];
    const Icon = config.icon;
    return (
      <View className="flex-1 items-center justify-center px-8 pt-20">
        <Icon size={48} className="text-muted-foreground" />
        <Text className="mt-4 text-lg font-semibold text-foreground">
          {config.title}
        </Text>
        <Text className="mt-1 text-center text-sm text-muted-foreground">
          {config.subtitle}
        </Text>
      </View>
    );
  };

  const keyExtractor = (item: MyListingWithMatch) => item.id;

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        <View className="border-b border-border px-4 py-3">
          <Text className="text-xl font-bold text-foreground">My Listings</Text>
        </View>
        <View className="flex-row border-b border-border">
          {['Active', 'Matched', 'History'].map((label) => (
            <View key={label} className="flex-1 items-center pb-2.5 pt-3">
              <Skeleton className="h-4 w-16 rounded" />
            </View>
          ))}
        </View>
        <View className="flex-1 gap-3 px-4 pt-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <View key={`skeleton-${i}`} className="flex-row rounded-xl border border-border bg-card p-3">
              <Skeleton className="h-20 w-14 rounded-lg" />
              <View className="ml-3 flex-1 gap-2">
                <Skeleton className="h-4 w-20 rounded" />
                <Skeleton className="h-5 w-36 rounded" />
                <Skeleton className="h-3 w-16 rounded" />
              </View>
            </View>
          ))}
        </View>
      </SafeAreaView>
    );
  }

  const allListings = listings ?? [];

  // First-time empty state — no listings at all
  if (allListings.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        <View className="flex-1 px-6 pt-12">
          <Text className="text-2xl font-bold text-foreground">
            What are you looking to do?
          </Text>
          <Text className="mt-2 text-base text-muted-foreground">
            Create a listing to connect with traders near you.
          </Text>

          <View className="mt-8 gap-3">
            {LISTING_TYPE_DESCRIPTIONS.map((item) => (
              <Pressable
                key={item.type}
                onPress={handleCreatePress}
                className="flex-row items-center rounded-xl border border-border bg-card p-4 active:bg-accent"
              >
                <View className="flex-1">
                  <Text className="text-base font-semibold text-card-foreground">
                    {item.label}
                  </Text>
                  <Text className="mt-0.5 text-sm text-muted-foreground">
                    {item.description}
                  </Text>
                </View>
                <ArrowRight size={20} className="text-muted-foreground" />
              </Pressable>
            ))}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="border-b border-border px-4 py-3">
        <Text className="text-xl font-bold text-foreground">My Listings</Text>
      </View>

      <SegmentedFilter
        items={tabItems}
        value={activeTab}
        onValueChange={setActiveTab}
      />

      <FlatList
        data={currentData}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListEmptyComponent={renderEmptyState}
        refreshing={isRefetching}
        onRefresh={refetch}
        contentContainerClassName="pb-24 pt-3"
        contentContainerStyle={currentData.length === 0 ? { flex: 1 } : undefined}
      />

      <Pressable
        onPress={handleCreatePress}
        className="absolute bottom-8 right-6 h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg active:bg-primary/90"
      >
        <Plus size={24} color="white" />
      </Pressable>
    </SafeAreaView>
  );
};

export default MyListingsScreen;
