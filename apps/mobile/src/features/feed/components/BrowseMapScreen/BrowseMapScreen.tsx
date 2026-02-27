import React, { useMemo, useRef, useCallback, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MapView, { type Region } from 'react-native-maps';
import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { ArrowLeft, PackageOpen } from 'lucide-react-native';

import Skeleton from '@/components/ui/Skeleton/Skeleton';
import EmptyState from '@/components/ui/EmptyState/EmptyState';
import ShopMarker from '@/features/listings/components/ShopMarker/ShopMarker';
import TraderMarker from '@/features/listings/components/TraderMarker/TraderMarker';
import FilterBar from '../FilterBar/FilterBar';
import ListingCard from '../ListingCard/ListingCard';
import MarkerDetailContent from '../MarkerDetailContent/MarkerDetailContent';
import useFeedListings from '../../hooks/useFeedListings/useFeedListings';
import useBrowseShops from '../../hooks/useBrowseShops/useBrowseShops';
import useUserLocation from '@/hooks/useUserLocation/useUserLocation';
import type { ListingWithDistance } from '../../schemas';
import type { RelevantShop } from '@/features/listings/schemas';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/** Approximate height of the floating header bar in pixels. */
const HEADER_HEIGHT = 80;

/** Duration (ms) for the camera animation when centering on a marker. */
const CAMERA_ANIMATION_MS = 500;

/** The snap index the sheet moves to when showing marker details. */
const DETAIL_SNAP_INDEX = 1;

// Melbourne fallback
const FALLBACK_REGION: Region = {
  latitude: -37.8136,
  longitude: 144.9631,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
};

const SNAP_FRACTIONS = [0.2, 0.55, 0.92] as const;

/**
 * Full-screen map + bottom sheet browse screen.
 * Shows nearby shops as markers on the map and listings in a
 * draggable bottom sheet with filter chips and infinite scroll.
 *
 * Tapping a marker centers it in the visible map area (above the
 * bottom sheet) and shows shop/trader details in the sheet.
 */
const BrowseMapScreen = () => {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const userLocation = useUserLocation();
  const { data: shops = [] } = useBrowseShops();

  const {
    data,
    isLoading,
    error,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    isRefetching,
  } = useFeedListings();

  const listings = data?.pages.flatMap((page) => page.listings) ?? [];

  const snapPoints = useMemo(() => ['20%', '55%', '92%'], []);

  const initialRegion = useMemo<Region>(() => {
    if (userLocation) {
      return {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.08,
        longitudeDelta: 0.08,
      };
    }
    return FALLBACK_REGION;
  }, [userLocation]);

  // Track the map region so we can compute degrees-per-pixel for camera offsets.
  const regionRef = useRef<Region>(initialRegion);
  const handleRegionChange = useCallback((region: Region) => {
    regionRef.current = region;
  }, []);

  // Selected marker — when non-null the sheet shows detail content.
  const [selectedShop, setSelectedShop] = useState<RelevantShop | null>(null);

  // Split shops into verified (ShopMarker) and non-verified (TraderMarker).
  const verifiedShops = useMemo(() => shops.filter((s) => s.verified), [shops]);
  const unverifiedShops = useMemo(() => shops.filter((s) => !s.verified), [shops]);

  /**
   * Center the given coordinate in the visible map area above the bottom sheet.
   *
   * The MapView fills the entire screen, but the bottom sheet overlaps it.
   * We offset the camera center south so the target coordinate appears in
   * the vertical center of the unobstructed map area.
   */
  const centerOnCoordinate = useCallback((lat: number, lng: number) => {
    const region = regionRef.current;

    // Height (pixels) the bottom sheet occupies at the detail snap index.
    const sheetPixels = SCREEN_HEIGHT * SNAP_FRACTIONS[DETAIL_SNAP_INDEX];

    // Vertical center of the visible area (between header and sheet top).
    // visibleTop = HEADER_HEIGHT, visibleBottom = SCREEN_HEIGHT - sheetPixels
    // centerOfVisible = (visibleTop + visibleBottom) / 2
    // centerOfMap     = SCREEN_HEIGHT / 2
    // pixelOffset     = centerOfMap - centerOfVisible
    const pixelOffset = (sheetPixels - HEADER_HEIGHT) / 2;

    // Convert pixel offset to latitude degrees using the current zoom level.
    const degreesPerPixel = region.latitudeDelta / SCREEN_HEIGHT;
    const latOffset = degreesPerPixel * pixelOffset;

    mapRef.current?.animateToRegion(
      {
        latitude: lat - latOffset,
        longitude: lng,
        latitudeDelta: region.latitudeDelta,
        longitudeDelta: region.longitudeDelta,
      },
      CAMERA_ANIMATION_MS,
    );
  }, []);

  /** Handle tap on any map marker (shop or trader). */
  const handleMarkerPress = useCallback(
    (shop: RelevantShop) => {
      setSelectedShop(shop);

      // Snap the sheet to the detail position.
      bottomSheetRef.current?.snapToIndex(DETAIL_SNAP_INDEX);

      // Center the marker in the visible area.
      centerOnCoordinate(shop.lat, shop.lng);
    },
    [centerOnCoordinate],
  );

  /** Close the detail view and return to listings. */
  const handleDetailClose = useCallback(() => {
    setSelectedShop(null);
  }, []);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderItem = useCallback(
    ({ item }: { item: ListingWithDistance }) => (
      <ListingCard listing={item} className="mx-4 mb-3" />
    ),
    [],
  );

  const keyExtractor = useCallback(
    (item: ListingWithDistance) => item.id,
    [],
  );

  const ListHeaderComponent = useMemo(
    () => (
      <View>
        <FilterBar className="pt-2" />
        {isLoading && (
          <View className="gap-3 px-4 pt-1">
            {Array.from({ length: 4 }).map((_, i) => (
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
        )}
        {error && !isLoading && (
          <View className="items-center px-8 py-6">
            <Text className="mb-2 text-lg font-semibold text-destructive">Feed Error</Text>
            <Text className="mb-4 text-center text-sm text-muted-foreground">
              {error.message}
            </Text>
            <Pressable
              onPress={() => refetch()}
              className="rounded-lg bg-primary px-6 py-2"
            >
              <Text className="font-semibold text-primary-foreground">Retry</Text>
            </Pressable>
          </View>
        )}
      </View>
    ),
    [isLoading, error, refetch],
  );

  const ListEmptyComponent = useMemo(() => {
    if (isLoading || error) return null;
    return (
      <EmptyState
        icon={<PackageOpen size={48} className="text-muted-foreground" />}
        title="No Listings Found"
        description="Try adjusting your filters or check back later for new listings in your area."
      />
    );
  }, [isLoading, error]);

  const ListFooterComponent = useMemo(
    () =>
      isFetchingNextPage ? (
        <View className="items-center py-4">
          <ActivityIndicator />
        </View>
      ) : null,
    [isFetchingNextPage],
  );

  return (
    <View className="flex-1 bg-background">
      <MapView
        ref={mapRef}
        style={{ width: SCREEN_WIDTH, flex: 1 }}
        initialRegion={initialRegion}
        onRegionChangeComplete={handleRegionChange}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {verifiedShops.map((shop) => (
          <ShopMarker
            key={`shop-${shop.id}`}
            shop={shop}
            onPress={handleMarkerPress}
          />
        ))}
        {unverifiedShops.map((shop) => (
          <TraderMarker
            key={`trader-${shop.id}`}
            shop={shop}
            onPress={handleMarkerPress}
          />
        ))}
      </MapView>

      {/* Floating header */}
      <SafeAreaView
        edges={['top']}
        className="absolute left-0 right-0 top-0"
        style={{ pointerEvents: 'box-none' }}
      >
        <View className="mx-4 mt-1 flex-row items-center rounded-xl bg-background/90 px-3 py-2.5 shadow-sm">
          <Pressable onPress={handleBack} className="p-1">
            <ArrowLeft size={22} className="text-foreground" />
          </Pressable>
          <Text className="ml-3 text-base font-semibold text-foreground">
            Browse
          </Text>
        </View>
      </SafeAreaView>

      {/* Bottom sheet — listings or marker details */}
      <BottomSheet
        ref={bottomSheetRef}
        index={1}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        enablePanDownToClose={false}
        backgroundStyle={{ borderRadius: 20, backgroundColor: '#0f0f13' }}
        handleIndicatorStyle={{ backgroundColor: '#a1a1aa', width: 40 }}
      >
        {selectedShop ? (
          <MarkerDetailContent shop={selectedShop} onClose={handleDetailClose} />
        ) : (
          <BottomSheetFlatList
            data={listings}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.5}
            refreshing={isRefetching}
            onRefresh={() => refetch()}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListHeaderComponent={ListHeaderComponent}
            ListEmptyComponent={ListEmptyComponent}
            ListFooterComponent={ListFooterComponent}
          />
        )}
      </BottomSheet>
    </View>
  );
};

export default BrowseMapScreen;
