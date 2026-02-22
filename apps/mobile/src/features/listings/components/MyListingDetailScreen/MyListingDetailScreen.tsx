import React, { useCallback, useMemo, useRef } from 'react';
import { View, Text, Pressable, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MapView, { Region } from 'react-native-maps';
import BottomSheet, { BottomSheetFlatList, BottomSheetScrollView, type BottomSheetFlatListMethods } from '@gorhom/bottom-sheet';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react-native';

import Skeleton from '@/components/ui/Skeleton/Skeleton';
import useListingDetail from '@/features/feed/hooks/useListingDetail/useListingDetail';
import useRelevantListings from '../../hooks/useRelevantListings/useRelevantListings';
import useInitiateContact from '../../hooks/useInitiateContact/useInitiateContact';
import useDeleteListing from '../../hooks/useDeleteListing/useDeleteListing';
import MyCardSummary from '../MyCardSummary/MyCardSummary';
import RelevantListingCard from '../RelevantListingCard/RelevantListingCard';
import TraderMarker from '../TraderMarker/TraderMarker';
import ShopMarker from '../ShopMarker/ShopMarker';
import type { RelevantListing } from '../../schemas';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SECTION_LABELS: Record<string, string> = {
  wts: 'Nearby Buyers',
  wtb: 'Nearby Sellers',
  wtt: 'Trade Partners',
};

/**
 * Owner-facing listing detail screen with full-screen map and
 * Airbnb-style draggable bottom sheet showing relevant nearby
 * traders and game stores.
 */
const MyListingDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const flatListRef = useRef<BottomSheetFlatListMethods>(null);

  const { data: listing, isLoading: isListingLoading } = useListingDetail(id ?? '');
  const { data: relevantData, isLoading: isRelevantLoading } = useRelevantListings(id ?? '');
  const initiateContact = useInitiateContact();
  const deleteListing = useDeleteListing();

  const snapPoints = useMemo(() => ['20%', '55%', '92%'], []);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleDelete = useCallback(() => {
    if (!id) return;
    deleteListing.mutate(id, {
      onSuccess: () => router.back(),
    });
  }, [id, deleteListing, router]);

  const handleContact = useCallback(
    (theirListingId: string) => {
      if (!id) return;
      initiateContact.mutate({
        myListingId: id,
        theirListingId,
      });
    },
    [id, initiateContact],
  );

  const handleMarkerPress = useCallback(
    (relevantListing: RelevantListing) => {
      // Expand bottom sheet and scroll to the listing
      bottomSheetRef.current?.snapToIndex(2);
      const index = relevantData?.listings.findIndex((l) => l.id === relevantListing.id) ?? -1;
      if (index >= 0) {
        // Small delay to allow sheet animation to complete
        setTimeout(() => {
          flatListRef.current?.scrollToIndex({ index, animated: true });
        }, 300);
      }
    },
    [relevantData],
  );

  // Compute initial map region from markers
  const initialRegion = useMemo<Region>(() => {
    const markers = relevantData?.listings
      .filter((l) => l.owner.approximate_lat !== 0 || l.owner.approximate_lng !== 0)
      .map((l) => ({
        lat: l.owner.approximate_lat,
        lng: l.owner.approximate_lng,
      })) ?? [];

    const shopMarkers = relevantData?.shops
      .filter((s) => s.lat !== 0 || s.lng !== 0)
      .map((s) => ({
        lat: s.lat,
        lng: s.lng,
      })) ?? [];

    const allPoints = [...markers, ...shopMarkers];

    if (allPoints.length === 0) {
      // Default to a reasonable center (will be overridden by user location in production)
      return {
        latitude: 37.7749,
        longitude: -122.4194,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };
    }

    const lats = allPoints.map((p) => p.lat);
    const lngs = allPoints.map((p) => p.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const latDelta = Math.max((maxLat - minLat) * 1.5, 0.02);
    const lngDelta = Math.max((maxLng - minLng) * 1.5, 0.02);

    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: latDelta,
      longitudeDelta: lngDelta,
    };
  }, [relevantData]);

  // Loading state
  if (isListingLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (!listing) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <Text className="text-base text-muted-foreground">Listing not found</Text>
        <Pressable onPress={handleBack} className="mt-4">
          <Text className="text-sm font-medium text-primary">Go back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const relevantListings = relevantData?.listings ?? [];
  const shops = relevantData?.shops ?? [];
  const sectionLabel = SECTION_LABELS[listing.type] ?? 'Nearby Traders';
  const count = relevantListings.length;

  const renderRelevantItem = ({ item }: { item: RelevantListing }) => (
    <RelevantListingCard
      listing={item}
      ownerListingType={listing.type}
      onContact={handleContact}
      isContacting={initiateContact.isPending}
    />
  );

  return (
    <View className="flex-1 bg-background">
      {/* Map fills the viewport */}
      <MapView
        style={{ width: SCREEN_WIDTH, flex: 1 }}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {relevantListings.map((rl) => (
          <TraderMarker
            key={`trader-${rl.id}`}
            listing={rl}
            onPress={handleMarkerPress}
          />
        ))}
        {shops.map((shop) => (
          <ShopMarker key={`shop-${shop.id}`} shop={shop} />
        ))}
      </MapView>

      {/* Header bar overlaid on map */}
      <SafeAreaView
        edges={['top']}
        className="absolute left-0 right-0 top-0"
        style={{ pointerEvents: 'box-none' }}
      >
        <View className="mx-4 mt-1 flex-row items-center justify-between rounded-xl bg-background/90 px-3 py-2.5 shadow-sm">
          <Pressable onPress={handleBack} className="p-1">
            <ArrowLeft size={22} className="text-foreground" />
          </Pressable>

          <Text className="flex-1 px-3 text-base font-semibold text-foreground" numberOfLines={1}>
            {listing.card_name}
          </Text>

          <View className="flex-row gap-1">
            <Pressable
              onPress={() => router.push(`/(tabs)/(listings)/listing/${id}/edit`)}
              className="p-2"
            >
              <Pencil size={18} className="text-muted-foreground" />
            </Pressable>
            <Pressable onPress={handleDelete} className="p-2" disabled={deleteListing.isPending}>
              {deleteListing.isPending ? (
                <ActivityIndicator size="small" />
              ) : (
                <Trash2 size={18} className="text-destructive" />
              )}
            </Pressable>
          </View>
        </View>
      </SafeAreaView>

      {/* Airbnb-style bottom sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        index={1}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        enablePanDownToClose={false}
        backgroundStyle={{ borderRadius: 20, backgroundColor: '#0f0f13' }}
        handleIndicatorStyle={{ backgroundColor: '#a1a1aa', width: 40 }}
      >
        {count > 0 && !isRelevantLoading ? (
          <BottomSheetFlatList
            ref={flatListRef}
            data={relevantListings}
            keyExtractor={(item: RelevantListing) => item.id}
            renderItem={renderRelevantItem}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListHeaderComponent={
              <>
                <MyCardSummary listing={listing} />
                <View className="border-t border-border px-4 pb-2 pt-3">
                  <Text className="text-sm font-semibold text-muted-foreground">
                    {count} {sectionLabel}
                  </Text>
                </View>
              </>
            }
          />
        ) : (
          <BottomSheetScrollView>
            <MyCardSummary listing={listing} />
            <View className="border-t border-border px-4 pb-2 pt-3">
              {isRelevantLoading ? (
                <Skeleton className="h-5 w-32 rounded" />
              ) : (
                <Text className="text-sm font-semibold text-muted-foreground">
                  No {sectionLabel.toLowerCase()} found
                </Text>
              )}
            </View>
            {isRelevantLoading ? (
              <View className="gap-3 px-4 pt-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={`skel-${i}`} className="h-28 w-full rounded-xl" />
                ))}
              </View>
            ) : (
              <View className="items-center px-4 py-10">
                <Text className="text-center text-sm text-muted-foreground">
                  No matching listings found nearby.{'\n'}Try expanding your search radius in settings.
                </Text>
              </View>
            )}
          </BottomSheetScrollView>
        )}
      </BottomSheet>
    </View>
  );
};

export default MyListingDetailScreen;
