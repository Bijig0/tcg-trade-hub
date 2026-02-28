import React, { useState, useCallback, useMemo, useRef } from 'react';
import { View, Text, Pressable, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MapView from 'react-native-maps';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { ArrowLeft, MessageCircle, XCircle, Navigation } from 'lucide-react-native';

import Avatar from '@/components/ui/Avatar/Avatar';
import Badge from '@/components/ui/Badge/Badge';
import Separator from '@/components/ui/Separator/Separator';
import Button from '@/components/ui/Button/Button';
import useUserLocation from '@/hooks/useUserLocation/useUserLocation';
import MapDirectionsOverlay from '@/components/MapDirectionsOverlay/MapDirectionsOverlay';
import DirectionsInfoBar from '@/components/DirectionsInfoBar/DirectionsInfoBar';
import openMapsNavigation from '@/utils/openMapsNavigation/openMapsNavigation';
import { useSheetPositionStore } from '@/stores/sheetPositionStore/sheetPositionStore';
import useMeetupDetail from '../../hooks/useMeetupDetail/useMeetupDetail';
import useCompleteMeetup from '../../hooks/useCompleteMeetup/useCompleteMeetup';
import useCancelMeetup from '../../hooks/useCancelMeetup/useCancelMeetup';
import useRealtimeMeetupUpdates from '../../hooks/useRealtimeMeetupUpdates/useRealtimeMeetupUpdates';
import RatingModal from '../RatingModal/RatingModal';
import DevMeetupActions from '../DevMeetupActions/DevMeetupActions';
import MeetupMapMarker from '../MeetupMapMarker/MeetupMapMarker';
import CompletionBar from '../CompletionBar/CompletionBar';
import OfferPreviewSection from '../OfferPreviewSection/OfferPreviewSection';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const FALLBACK_REGION = {
  latitude: -37.8136,
  longitude: 144.9631,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};

const SHEET_KEY = 'meetup-detail';

/**
 * Full-screen meetup detail with MapView background and draggable bottom sheet.
 *
 * Shows the meetup location on a map with a custom marker, and all details
 * (location info, other user, offer preview, completion bar, actions)
 * inside a persisted-position bottom sheet.
 */
const MeetupDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: meetup, isLoading, isError } = useMeetupDetail(id ?? '');
  const [ratingVisible, setRatingVisible] = useState(false);
  const [rateeId, setRateeId] = useState('');
  const [routeInfo, setRouteInfo] = useState<{ distance: number; duration: number } | null>(null);
  const mapRef = useRef<MapView>(null);
  const userLocation = useUserLocation();

  const { getPosition, setPosition } = useSheetPositionStore();

  const handleBothCompleted = useCallback(
    (_meetupId: string) => {
      if (meetup) {
        setRateeId(meetup.other_user.id);
        setRatingVisible(true);
      }
    },
    [meetup],
  );

  const completeMeetup = useCompleteMeetup(handleBothCompleted);
  const cancelMeetup = useCancelMeetup();

  const snapPoints = useMemo(() => ['15%', '55%', '85%'], []);
  const initialIndex = getPosition(SHEET_KEY, 2);

  const handleSheetChange = useCallback(
    (index: number) => {
      setPosition(SHEET_KEY, index);
    },
    [setPosition],
  );

  const mapRegion = useMemo(() => {
    if (meetup?.shopCoords) {
      return {
        latitude: meetup.shopCoords.latitude,
        longitude: meetup.shopCoords.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      };
    }
    return FALLBACK_REGION;
  }, [meetup?.shopCoords]);

  const handleDirectionsReady = useCallback(
    (result: { distance: number; duration: number }) => {
      setRouteInfo(result);
      if (meetup?.shopCoords && userLocation && mapRef.current) {
        mapRef.current.fitToCoordinates(
          [userLocation, meetup.shopCoords],
          { edgePadding: { top: 80, right: 60, bottom: 320, left: 60 }, animated: true },
        );
      }
    },
    [meetup?.shopCoords, userLocation],
  );

  const handleGetDirections = useCallback(() => {
    if (meetup?.shopCoords) {
      const locationName = shop?.name ?? meetup.location_name ?? 'Location TBD';
      openMapsNavigation({
        latitude: meetup.shopCoords.latitude,
        longitude: meetup.shopCoords.longitude,
        label: locationName,
      });
    }
  }, [meetup?.shopCoords, meetup?.location_name, shop?.name]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background" edges={['top']}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  if (isError || !meetup) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background px-6" edges={['top']}>
        <Text className="text-center text-base text-destructive">
          Failed to load meetup details.
        </Text>
      </SafeAreaView>
    );
  }

  const { other_user, shop, proposed_time, status, is_user_a } = meetup;

  const initials = other_user.display_name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const formattedTime = proposed_time
    ? new Date(proposed_time).toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : 'To be determined';

  const locationName = shop?.name ?? meetup.location_name ?? 'Location TBD';
  const locationAddress = shop?.address ?? null;

  const userCompleted = is_user_a ? meetup.user_a_completed : meetup.user_b_completed;
  const otherCompleted = is_user_a ? meetup.user_b_completed : meetup.user_a_completed;

  const statusLabel =
    status === 'proposed'
      ? 'Proposed'
      : status === 'confirmed'
        ? 'Confirmed'
        : status === 'completed'
          ? 'Completed'
          : 'Cancelled';

  const statusVariant =
    status === 'proposed'
      ? 'outline'
      : status === 'confirmed'
        ? 'default'
        : status === 'completed'
          ? 'secondary'
          : 'destructive';

  const handleOpenChat = () => {
    if (meetup.conversation) {
      router.push(`/(tabs)/(messages)/chat/${meetup.conversation.id}`);
    }
  };

  const handleComplete = () => {
    completeMeetup.mutate({ meetupId: meetup.id });
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Meetup',
      'Are you sure you want to cancel this meetup?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () =>
            cancelMeetup.mutate({
              meetupId: meetup.id,
              conversationId: meetup.conversation?.id ?? '',
            }),
        },
      ],
    );
  };

  const isProposed = status === 'proposed';
  const showDirections = status === 'confirmed' && !!userLocation && !!meetup.shopCoords;

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
        {meetup.shopCoords && (
          <MeetupMapMarker
            coordinate={meetup.shopCoords}
            title={locationName}
          />
        )}
        {showDirections && (
          <MapDirectionsOverlay
            origin={userLocation}
            destination={meetup.shopCoords}
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
            <View className="flex-row items-center justify-between">
              <Text className="flex-1 text-xl font-bold text-foreground" numberOfLines={1}>
                {locationName}
              </Text>
              <Badge variant={statusVariant as 'default' | 'secondary' | 'destructive' | 'outline'}>
                {statusLabel}
              </Badge>
            </View>
            {locationAddress ? (
              <Text className="mt-1 text-sm text-muted-foreground">{locationAddress}</Text>
            ) : null}
            {routeInfo && (
              <DirectionsInfoBar distanceKm={routeInfo.distance} durationMin={routeInfo.duration} />
            )}
            <Text className="mt-2 text-base text-foreground">{formattedTime}</Text>
          </View>

          <View className="px-4 py-4">
            <Separator />
          </View>

          {/* Other user info */}
          <View className="flex-row items-center px-4">
            <Avatar uri={other_user.avatar_url} fallback={initials} size="lg" />
            <View className="ml-3 flex-1">
              <Text className="text-base font-semibold text-foreground">
                {other_user.display_name}
              </Text>
              <View className="flex-row items-center gap-2">
                <Text className="text-sm text-muted-foreground">
                  {other_user.rating_score > 0
                    ? `${'★'.repeat(Math.round(other_user.rating_score))} ${other_user.rating_score.toFixed(1)}`
                    : 'New trader'}
                </Text>
                {other_user.total_trades > 0 ? (
                  <Text className="text-sm text-muted-foreground">
                    {other_user.total_trades} trade{other_user.total_trades !== 1 ? 's' : ''}
                  </Text>
                ) : null}
              </View>
            </View>
          </View>

          {/* Offer preview */}
          <View className="px-4 pt-4">
            <OfferPreviewSection
              listingItems={meetup.listingItems}
              offerItems={meetup.offerItems}
              conversationId={meetup.conversation?.id ?? null}
            />
          </View>

          {/* Completion bar (confirmed only, not proposed) */}
          {status === 'confirmed' && (
            <View className="px-4 pt-4">
              <CompletionBar
                userCompleted={userCompleted}
                otherCompleted={otherCompleted}
                otherUserName={other_user.display_name}
                otherUserAvatarUrl={other_user.avatar_url}
                onComplete={handleComplete}
                isPending={completeMeetup.isPending}
              />
            </View>
          )}

          {/* Dev actions (dev mode only) */}
          {__DEV__ && status === 'confirmed' && (
            <DevMeetupActions
              meetupId={meetup.id}
              otherCompletionField={is_user_a ? 'user_b_completed' : 'user_a_completed'}
            />
          )}

          {/* Action buttons */}
          <View className="gap-3 px-4 pt-6">
            {meetup.shopCoords && status === 'confirmed' ? (
              <Button variant="default" onPress={handleGetDirections}>
                <View className="flex-row items-center gap-2">
                  <Navigation size={18} className="text-primary-foreground" />
                  <Text className="text-base font-semibold text-primary-foreground">
                    Get Directions
                  </Text>
                </View>
              </Button>
            ) : null}

            {meetup.conversation ? (
              <Button variant="outline" onPress={handleOpenChat}>
                <View className="flex-row items-center gap-2">
                  <MessageCircle size={18} className="text-foreground" />
                  <Text className="text-base font-medium text-foreground">Open Chat</Text>
                </View>
              </Button>
            ) : null}

            {(status === 'confirmed' || isProposed) ? (
              <Button
                variant="destructive"
                onPress={handleCancel}
                disabled={cancelMeetup.isPending}
              >
                <View className="flex-row items-center gap-2">
                  <XCircle size={18} className="text-destructive-foreground" />
                  <Text className="text-base font-semibold text-destructive-foreground">
                    {cancelMeetup.isPending
                      ? 'Cancelling...'
                      : isProposed
                        ? 'Decline Meetup'
                        : 'Cancel Meetup'}
                  </Text>
                </View>
              </Button>
            ) : null}
          </View>
        </BottomSheetScrollView>
      </BottomSheet>

      {/* Rating modal overlay */}
      <RatingModal
        visible={ratingVisible}
        onClose={() => setRatingVisible(false)}
        meetupId={meetup.id}
        rateeId={rateeId}
      />
    </View>
  );
};

export default MeetupDetailScreen;
