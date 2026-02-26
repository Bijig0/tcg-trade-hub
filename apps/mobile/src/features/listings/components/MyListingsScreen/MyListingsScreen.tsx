import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, SectionList, Pressable, Alert } from 'react-native';

import { useRouter } from 'expo-router';
import { Plus, ArrowRight, Package, Handshake, Archive } from 'lucide-react-native';
import SegmentedFilter from '@/components/ui/SegmentedFilter/SegmentedFilter';
import RefreshableScreen from '@/components/ui/RefreshableScreen/RefreshableScreen';
import Skeleton from '@/components/ui/Skeleton/Skeleton';
import useMyListings from '../../hooks/useMyListings/useMyListings';
import useDeleteListing from '../../hooks/useDeleteListing/useDeleteListing';
import usePrefetchActiveListingDetails from '../../hooks/usePrefetchActiveListingDetails/usePrefetchActiveListingDetails';
import { listingKeys } from '../../queryKeys';
import groupListingsByTab from '../../utils/groupListingsByTab/groupListingsByTab';
import ActiveListingCard from '../ActiveListingCard/ActiveListingCard';
import MatchedListingCard from '../MatchedListingCard/MatchedListingCard';
import HistoryListingCard from '../HistoryListingCard/HistoryListingCard';
import type { MyListingWithOffers, ListingTab } from '../../schemas';
import type { ListingType } from '@tcg-trade-hub/database';
import type { SegmentedFilterItem } from '@/components/ui/SegmentedFilter/SegmentedFilter';

const LISTING_TYPE_DESCRIPTIONS = [
  { type: 'WTS', label: 'Want to Sell', description: 'List cards you want to sell' },
  { type: 'WTB', label: 'Want to Buy', description: 'Post cards you\'re looking for' },
  { type: 'WTT', label: 'Want to Trade', description: 'Find trade partners nearby' },
] as const;

const TYPE_SECTION_HEADERS: Record<ListingType, string> = {
  wts: 'Want to Sell',
  wtb: 'Want to Buy',
  wtt: 'Want to Trade',
};

/** Order in which type sections appear */
const TYPE_ORDER: ListingType[] = ['wts', 'wtb', 'wtt'];

type TypeSection = {
  title: string;
  type: ListingType;
  data: MyListingWithOffers[];
};

/**
 * Groups a flat listing array into sections by listing type.
 * Only includes sections that have at least one listing.
 */
const groupByType = (items: MyListingWithOffers[]): TypeSection[] => {
  const byType: Record<ListingType, MyListingWithOffers[]> = { wts: [], wtb: [], wtt: [] };
  for (const item of items) {
    byType[item.type].push(item);
  }
  return TYPE_ORDER
    .filter((t) => byType[t].length > 0)
    .map((t) => ({ title: TYPE_SECTION_HEADERS[t], type: t, data: byType[t] }));
};

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
 * Each tab shows a SectionList grouped by listing type.
 * First-time empty state (zero total listings) shows onboarding view.
 */
const MyListingsScreen = () => {
  const router = useRouter();
  const { data: listings, isLoading } = useMyListings();
  usePrefetchActiveListingDetails(listings);
  const deleteListing = useDeleteListing();
  const [activeTab, setActiveTab] = useState<ListingTab>('active');

  const handleCreatePress = (type?: ListingType) => {
    if (type) {
      router.push({ pathname: '/(tabs)/(listings)/new', params: { type } });
    } else {
      router.push('/(tabs)/(listings)/new');
    }
  };

  const handleDeletePress = useCallback(
    (listing: MyListingWithOffers) => {
      Alert.alert(
        'Remove Listing',
        `Are you sure you want to remove "${listing.title}"?`,
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
      { value: 'active', label: 'Active', count: counts.active, testID: 'listings-tab-active' },
      { value: 'matched', label: 'Matched', count: counts.matched, testID: 'listings-tab-matched' },
      { value: 'history', label: 'History', count: counts.history, testID: 'listings-tab-history' },
    ],
    [counts],
  );

  const currentData = groups[activeTab];

  const sections = useMemo(() => groupByType(currentData), [currentData]);

  const renderSectionHeader = useCallback(
    ({ section }: { section: TypeSection }) => (
      <View className="bg-background px-4 pb-2 pt-4">
        <Text className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {section.title}
        </Text>
      </View>
    ),
    [],
  );

  const renderItem = useCallback(
    ({ item }: { item: MyListingWithOffers }) => {
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

  const keyExtractor = (item: MyListingWithOffers) => item.id;

  // Loading state
  if (isLoading) {
    return (
      <View className="flex-1 bg-background">
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
      </View>
    );
  }

  const allListings = listings ?? [];

  // First-time empty state -- no listings at all
  if (allListings.length === 0) {
    return (
      <View className="flex-1 bg-background">
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
                onPress={() => handleCreatePress(item.type.toLowerCase() as ListingType)}
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
      </View>
    );
  }

  return (
    <RefreshableScreen queryKeys={[listingKeys.myListings()]}>
      {({ onRefresh, isRefreshing }) => (
        <View testID="listings-screen" className="flex-1 bg-background">
          <SegmentedFilter
            items={tabItems}
            value={activeTab}
            onValueChange={setActiveTab}
          />

          <SectionList
            sections={sections}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            renderSectionHeader={renderSectionHeader}
            ListEmptyComponent={renderEmptyState}
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            contentContainerClassName="pb-24"
            contentContainerStyle={sections.length === 0 ? { flex: 1 } : undefined}
            stickySectionHeadersEnabled={false}
          />

          <Pressable
            testID="listings-create-fab"
            onPress={() => handleCreatePress()}
            className="absolute bottom-8 right-6 h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg active:bg-primary/90"
          >
            <Plus size={24} color="white" />
          </Pressable>
        </View>
      )}
    </RefreshableScreen>
  );
};

export default MyListingsScreen;
