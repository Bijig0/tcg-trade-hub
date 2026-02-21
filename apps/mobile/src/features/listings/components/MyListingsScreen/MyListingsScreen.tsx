import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, Image, Pressable, SectionList, Alert, type SectionListRenderItemInfo } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus, Trash2, Clock, ArrowRight, ChevronDown, ChevronRight } from 'lucide-react-native';
import Badge from '@/components/ui/Badge/Badge';
import Skeleton from '@/components/ui/Skeleton/Skeleton';
import useMyListings from '../../hooks/useMyListings/useMyListings';
import useDeleteListing from '../../hooks/useDeleteListing/useDeleteListing';
import type { ListingRow, ListingStatus } from '@tcg-trade-hub/database';

type ListingSection = {
  title: string;
  key: string;
  data: ListingRow[];
  isHistory?: boolean;
  historyCount?: number;
};

const LISTING_TYPE_CONFIG = {
  wts: { label: 'WTS', variant: 'default' as const },
  wtb: { label: 'WTB', variant: 'secondary' as const },
  wtt: { label: 'WTT', variant: 'outline' as const },
} as const;

const STATUS_CONFIG: Record<ListingStatus, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  active: { label: 'Active', variant: 'default' },
  matched: { label: 'Matched', variant: 'secondary' },
  completed: { label: 'Completed', variant: 'outline' },
  expired: { label: 'Removed', variant: 'destructive' },
};

const SECTION_HEADERS = {
  wts: 'Want to Sell',
  wtb: 'Want to Buy',
  wtt: 'Want to Trade',
} as const;

const LISTING_TYPE_DESCRIPTIONS = [
  { type: 'WTS', label: 'Want to Sell', description: 'List cards you want to sell' },
  { type: 'WTB', label: 'Want to Buy', description: 'Post cards you\'re looking for' },
  { type: 'WTT', label: 'Want to Trade', description: 'Find trade partners nearby' },
] as const;

const ACTIVE_STATUSES = new Set<ListingStatus>(['active', 'matched']);
const HISTORY_STATUSES = new Set<ListingStatus>(['completed', 'expired']);

/**
 * Main listings screen and app landing page.
 *
 * Groups active/matched listings by type (WTS, WTB, WTT) with section headers.
 * Shows a collapsible History section at the bottom for completed/expired listings.
 * Matched listings are highlighted with a colored left border.
 */
const MyListingsScreen = () => {
  const router = useRouter();
  const { data: listings, isLoading, refetch, isRefetching } = useMyListings();
  const deleteListing = useDeleteListing();
  const [historyExpanded, setHistoryExpanded] = useState(false);

  const handleCreatePress = () => {
    router.push('/(tabs)/(listings)/new');
  };

  const handleDeletePress = useCallback(
    (listing: ListingRow) => {
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

  const sections = useMemo(() => {
    const allListings = listings ?? [];

    const active = allListings.filter((l) => ACTIVE_STATUSES.has(l.status));
    const history = allListings.filter((l) => HISTORY_STATUSES.has(l.status));

    const wts = active.filter((l) => l.type === 'wts');
    const wtb = active.filter((l) => l.type === 'wtb');
    const wtt = active.filter((l) => l.type === 'wtt');

    const result: ListingSection[] = [];

    if (wts.length > 0) result.push({ title: SECTION_HEADERS.wts, key: 'wts', data: wts });
    if (wtb.length > 0) result.push({ title: SECTION_HEADERS.wtb, key: 'wtb', data: wtb });
    if (wtt.length > 0) result.push({ title: SECTION_HEADERS.wtt, key: 'wtt', data: wtt });

    if (history.length > 0) {
      result.push({
        title: 'History',
        key: 'history',
        data: historyExpanded ? history : [],
        isHistory: true,
        historyCount: history.length,
      });
    }

    return result;
  }, [listings, historyExpanded]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderItem = ({ item, section }: SectionListRenderItemInfo<ListingRow, ListingSection>) => {
    const typeConfig = LISTING_TYPE_CONFIG[item.type];
    const statusConfig = STATUS_CONFIG[item.status];
    const isMatched = item.status === 'matched';
    const isHistory = section.isHistory === true;

    return (
      <Pressable
        onPress={() => router.push(`/(tabs)/(listings)/listing/${item.id}`)}
        className={`mx-4 mb-3 flex-row rounded-xl border border-border bg-card p-3 active:bg-accent ${
          isMatched ? 'border-l-4 border-l-primary' : ''
        } ${isHistory ? 'opacity-60' : ''}`}
      >
        <Image
          source={{ uri: item.card_image_url }}
          className="h-20 w-14 rounded-lg bg-muted"
          resizeMode="cover"
        />

        <View className="ml-3 flex-1 justify-between">
          <View>
            <View className="flex-row items-center gap-2">
              {!isHistory && <Badge variant={typeConfig.variant}>{typeConfig.label}</Badge>}
              <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
            </View>

            <Text
              className={`mt-1 text-base font-semibold ${isHistory ? 'text-muted-foreground' : 'text-card-foreground'}`}
              numberOfLines={1}
            >
              {item.card_name}
            </Text>

            {item.asking_price != null && (
              <Text className="text-sm text-muted-foreground">
                ${item.asking_price.toFixed(2)}
              </Text>
            )}
          </View>

          <View className="mt-1 flex-row items-center gap-1">
            <Clock size={10} className="text-muted-foreground" />
            <Text className="text-xs text-muted-foreground">
              {formatDate(item.created_at)}
            </Text>
          </View>
        </View>

        {!isHistory && (
          <Pressable
            onPress={() => handleDeletePress(item)}
            className="ml-2 items-center justify-center px-1"
            hitSlop={8}
          >
            <Trash2 size={18} className="text-destructive" />
          </Pressable>
        )}
      </Pressable>
    );
  };

  const renderSectionHeader = ({ section }: { section: ListingSection }) => {
    if (section.isHistory) {
      return (
        <Pressable
          onPress={() => setHistoryExpanded((prev) => !prev)}
          className="mx-4 mb-2 mt-6 flex-row items-center justify-between rounded-lg bg-muted/50 px-3 py-2.5"
        >
          <View className="flex-row items-center gap-2">
            <Text className="text-base font-semibold text-muted-foreground">
              {section.title}
            </Text>
            <View className="rounded-full bg-muted px-2 py-0.5">
              <Text className="text-xs font-medium text-muted-foreground">
                {section.historyCount}
              </Text>
            </View>
          </View>
          {historyExpanded ? (
            <ChevronDown size={18} className="text-muted-foreground" />
          ) : (
            <ChevronRight size={18} className="text-muted-foreground" />
          )}
        </Pressable>
      );
    }

    return (
      <View className="bg-background px-4 pb-2 pt-5">
        <Text className="text-base font-semibold text-foreground">{section.title}</Text>
      </View>
    );
  };

  const keyExtractor = (item: ListingRow) => item.id;

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        <View className="border-b border-border px-4 py-3">
          <Text className="text-xl font-bold text-foreground">My Listings</Text>
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
  const hasActiveListings = allListings.some((l) => ACTIVE_STATUSES.has(l.status));

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

      {!hasActiveListings && (
        <View className="mx-4 mt-4 rounded-lg border border-dashed border-border bg-muted/30 p-4">
          <Text className="text-center text-sm text-muted-foreground">
            No active listings. Tap + to create one.
          </Text>
        </View>
      )}

      <SectionList
        sections={sections}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        refreshing={isRefetching}
        onRefresh={refetch}
        contentContainerClassName="pb-24"
        stickySectionHeadersEnabled={false}
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
