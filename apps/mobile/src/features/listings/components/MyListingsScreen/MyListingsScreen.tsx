import React, { useCallback } from 'react';
import { View, Text, Image, Pressable, FlatList, Alert, type ListRenderItemInfo } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus, Trash2, Clock, ArrowRight } from 'lucide-react-native';
import Badge from '@/components/ui/Badge/Badge';
import Skeleton from '@/components/ui/Skeleton/Skeleton';
import useMyListings from '../../hooks/useMyListings/useMyListings';
import useDeleteListing from '../../hooks/useDeleteListing/useDeleteListing';
import type { ListingRow } from '@tcg-trade-hub/database';

const LISTING_TYPE_CONFIG = {
  wts: { label: 'WTS', variant: 'default' as const },
  wtb: { label: 'WTB', variant: 'secondary' as const },
  wtt: { label: 'WTT', variant: 'outline' as const },
} as const;

const STATUS_CONFIG = {
  active: { label: 'Active', variant: 'default' as const },
  matched: { label: 'Matched', variant: 'secondary' as const },
  completed: { label: 'Completed', variant: 'outline' as const },
  expired: { label: 'Expired', variant: 'destructive' as const },
} as const;

const LISTING_TYPE_DESCRIPTIONS = [
  { type: 'WTS', label: 'Want to Sell', description: 'List cards you want to sell' },
  { type: 'WTB', label: 'Want to Buy', description: 'Post cards you\'re looking for' },
  { type: 'WTT', label: 'Want to Trade', description: 'Find trade partners nearby' },
] as const;

/**
 * Main listings screen and app landing page.
 *
 * When no listings exist, shows a welcoming empty state that explains
 * the three listing types (WTS, WTB, WTT) and prompts the user to
 * create their first listing. When listings exist, shows the user's
 * active listings in a FlatList with FAB for creating more.
 */
const MyListingsScreen = () => {
  const router = useRouter();
  const { data: listings, isLoading, refetch, isRefetching } = useMyListings();
  const deleteListing = useDeleteListing();

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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderItem = ({ item }: ListRenderItemInfo<ListingRow>) => {
    const typeConfig = LISTING_TYPE_CONFIG[item.type];
    const statusConfig = STATUS_CONFIG[item.status];

    return (
      <Pressable
        onPress={() => router.push(`/(tabs)/(listings)/listing/${item.id}`)}
        className="mx-4 mb-3 flex-row rounded-xl border border-border bg-card p-3 active:bg-accent"
      >
        <Image
          source={{ uri: item.card_image_url }}
          className="h-20 w-14 rounded-lg bg-muted"
          resizeMode="cover"
        />

        <View className="ml-3 flex-1 justify-between">
          <View>
            <View className="flex-row items-center gap-2">
              <Badge variant={typeConfig.variant}>{typeConfig.label}</Badge>
              <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
            </View>

            <Text className="mt-1 text-base font-semibold text-card-foreground" numberOfLines={1}>
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

        <Pressable
          onPress={() => handleDeletePress(item)}
          className="ml-2 items-center justify-center px-1"
          hitSlop={8}
        >
          <Trash2 size={18} className="text-destructive" />
        </Pressable>
      </Pressable>
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

  if (!listings || listings.length === 0) {
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

      <FlatList
        data={listings}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        refreshing={isRefetching}
        onRefresh={refetch}
        contentContainerClassName="pt-3 pb-24"
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
