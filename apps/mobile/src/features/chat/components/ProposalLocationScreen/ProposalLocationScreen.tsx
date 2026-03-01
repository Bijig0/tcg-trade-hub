import React, { useMemo, useCallback, useRef, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MapView from 'react-native-maps';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { ArrowLeft, MapPin, Clock, MessageSquare, Navigation } from 'lucide-react-native';

import { useSheetPositionStore } from '@/stores/sheetPositionStore/sheetPositionStore';
import useShopDetail from '@/features/shops/hooks/useShopDetail/useShopDetail';
import parseLocationCoords from '@/utils/parseLocationCoords/parseLocationCoords';
import MeetupMapMarker from '@/features/meetups/components/MeetupMapMarker/MeetupMapMarker';
import useUserLocation from '@/hooks/useUserLocation/useUserLocation';
import MapDirectionsOverlay from '@/components/MapDirectionsOverlay/MapDirectionsOverlay';
import DirectionsInfoBar from '@/components/DirectionsInfoBar/DirectionsInfoBar';
import openMapsNavigation from '@/utils/openMapsNavigation/openMapsNavigation';
import Button from '@/components/ui/Button/Button';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const FALLBACK_REGION = {
  latitude: -37.8136,
  longitude: 144.9631,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};

const SHEET_KEY = 'proposal-location';

/**
 * Full-screen map view for a meetup proposal location.
 * Reuses the same MapView + BottomSheet pattern as MeetupDetailScreen.
 *
 * Receives proposal data via route params and optionally fetches shop
 * details when a shop_id is present.
 */
const ProposalLocationScreen = () => {
  const params = useLocalSearchParams<{
    locationName?: string;
    lat?: string;
    lng?: string;
    shopId?: string;
    proposedTime?: string;
    note?: string;
  }>();

  const router = useRouter();
  const { getPosition, setPosition } = useSheetPositionStore();
  const mapRef = useRef<MapView>(null);
  const userLocation = useUserLocation();
  const [routeInfo, setRouteInfo] = useState<{ distance: number; duration: number } | null>(null);

  const shopId = params.shopId ?? null;
  const { data: shop, isLoading: isShopLoading } = useShopDetail(shopId);

  // Resolve coordinates: shop location > route params > fallback
  const resolvedCoords = useMemo(() => {
    if (shop) {
      const shopCoords = parseLocationCoords(
        (shop as Record<string, unknown>).location,
      );
      if (shopCoords) return shopCoords;
    }

    const lat = params.lat ? parseFloat(params.lat) : NaN;
    const lng = params.lng ? parseFloat(params.lng) : NaN;
    if (!isNaN(lat) && !isNaN(lng)) {
      return { latitude: lat, longitude: lng };
    }

    return null;
  }, [shop, params.lat, params.lng]);

  const mapRegion = useMemo(() => {
    if (resolvedCoords) {
      return {
        ...resolvedCoords,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      };
    }
    return FALLBACK_REGION;
  }, [resolvedCoords]);

  const snapPoints = useMemo(() => ['20%', '50%'], []);
  const initialIndex = getPosition(SHEET_KEY, 0);

  const handleSheetChange = useCallback(
    (index: number) => {
      setPosition(SHEET_KEY, index);
    },
    [setPosition],
  );

  const locationName = shop?.name ?? params.locationName ?? 'Location';
  const locationAddress = shop?.address ?? null;

  const formattedTime = useMemo(() => {
    if (!params.proposedTime) return null;
    const date = new Date(params.proposedTime);
    if (isNaN(date.getTime())) return null;
    return date.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  }, [params.proposedTime]);

  const showDirections = !!userLocation && !!resolvedCoords;

  const handleDirectionsReady = useCallback(
    (result: { distance: number; duration: number }) => {
      setRouteInfo(result);
      if (resolvedCoords && userLocation && mapRef.current) {
        mapRef.current.fitToCoordinates(
          [userLocation, resolvedCoords],
          { edgePadding: { top: 80, right: 60, bottom: 280, left: 60 }, animated: true },
        );
      }
    },
    [resolvedCoords, userLocation],
  );

  const handleGetDirections = useCallback(() => {
    if (resolvedCoords) {
      openMapsNavigation({
        latitude: resolvedCoords.latitude,
        longitude: resolvedCoords.longitude,
        label: locationName,
      });
    }
  }, [resolvedCoords, locationName]);

  if (shopId && isShopLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background" edges={['top']}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-background">
      {/* Full-screen map */}
      <MapView
        ref={mapRef}
        style={{ width: SCREEN_WIDTH, flex: 1 }}
        initialRegion={mapRegion}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {resolvedCoords && (
          <MeetupMapMarker
            coordinate={resolvedCoords}
            title={locationName}
          />
        )}
        {showDirections && (
          <MapDirectionsOverlay
            origin={userLocation}
            destination={resolvedCoords}
            onReady={handleDirectionsReady}
          />
        )}
      </MapView>

      {/* Floating back button */}
      <SafeAreaView
        edges={['top']}
        className="absolute left-0 right-0 top-0"
        style={{ pointerEvents: 'box-none' }}
      >
        <View className="mx-4 mt-1" style={{ pointerEvents: 'auto' }}>
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full bg-background/90 shadow-sm"
          >
            <ArrowLeft size={20} className="text-foreground" />
          </Pressable>
        </View>
      </SafeAreaView>

      {/* Bottom sheet */}
      <BottomSheet
        index={initialIndex}
        snapPoints={snapPoints}
        onChange={handleSheetChange}
        enableDynamicSizing={false}
        enablePanDownToClose={false}
        backgroundStyle={{ borderRadius: 20, backgroundColor: '#0f0f13' }}
        handleIndicatorStyle={{ backgroundColor: '#a1a1aa', width: 40 }}
      >
        <BottomSheetScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Location header */}
          <View className="px-4 pt-2">
            <View className="flex-row items-center gap-2">
              <MapPin size={20} className="text-amber-500" />
              <Text className="flex-1 text-xl font-bold text-foreground" numberOfLines={2}>
                {locationName}
              </Text>
            </View>
            {locationAddress ? (
              <Text className="ml-7 mt-1 text-sm text-muted-foreground">
                {locationAddress}
              </Text>
            ) : null}
            {routeInfo && (
              <View className="ml-7">
                <DirectionsInfoBar distanceKm={routeInfo.distance} durationMin={routeInfo.duration} />
              </View>
            )}
          </View>

          {/* Proposed time */}
          {formattedTime ? (
            <View className="mt-4 flex-row items-center gap-2 px-4">
              <Clock size={16} className="text-muted-foreground" />
              <Text className="text-base text-foreground">{formattedTime}</Text>
            </View>
          ) : null}

          {/* Note */}
          {params.note ? (
            <View className="mt-3 flex-row items-start gap-2 px-4">
              <MessageSquare size={16} className="mt-0.5 text-muted-foreground" />
              <Text className="flex-1 text-sm italic text-muted-foreground">
                &ldquo;{params.note}&rdquo;
              </Text>
            </View>
          ) : null}

          {/* Get Directions button */}
          {resolvedCoords ? (
            <View className="px-4 pt-4">
              <Button variant="default" onPress={handleGetDirections}>
                <View className="flex-row items-center gap-2">
                  <Navigation size={18} className="text-primary-foreground" />
                  <Text className="text-base font-semibold text-primary-foreground">
                    Get Directions
                  </Text>
                </View>
              </Button>
            </View>
          ) : null}
        </BottomSheetScrollView>
      </BottomSheet>
    </View>
  );
};

export default ProposalLocationScreen;
