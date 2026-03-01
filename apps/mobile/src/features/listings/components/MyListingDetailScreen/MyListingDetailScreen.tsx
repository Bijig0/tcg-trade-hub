import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, Dimensions, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MapView, { Marker } from 'react-native-maps';
import BottomSheet, { BottomSheetFlatList, BottomSheetScrollView, type BottomSheetFlatListMethods } from '@gorhom/bottom-sheet';
import { ArrowLeft, MapPin, Pencil, Trash2 } from 'lucide-react-native';

import Skeleton from '@/components/ui/Skeleton/Skeleton';
import SegmentedFilter from '@/components/ui/SegmentedFilter/SegmentedFilter';
import LocationPicker from '@/components/LocationPicker/LocationPicker';
import Button from '@/components/ui/Button/Button';
import parseLocationCoords from '@/utils/parseLocationCoords/parseLocationCoords';
import useListingDetail from '@/features/feed/hooks/useListingDetail/useListingDetail';
import useListingOffers from '../../hooks/useListingOffers/useListingOffers';
import useRespondToOffer from '../../hooks/useRespondToOffer/useRespondToOffer';
import useDeleteListing from '../../hooks/useDeleteListing/useDeleteListing';
import useRealtimeOfferUpdates from '../../hooks/useRealtimeOfferUpdates/useRealtimeOfferUpdates';
import useTradeOpportunities from '../../hooks/useTradeOpportunities/useTradeOpportunities';
import useUpdateListingLocation from '../../hooks/useUpdateListingLocation/useUpdateListingLocation';
import MyBundleSummary from '../MyBundleSummary/MyBundleSummary';
import ReceivedOfferCard from '../ReceivedOfferCard/ReceivedOfferCard';
import TradeOpportunityCard from '../TradeOpportunityCard/TradeOpportunityCard';
import ShopMarker from '../ShopMarker/ShopMarker';
import OfferDetailView from '../OfferDetailView/OfferDetailView';
import DevListingActions from '../DevListingActions/DevListingActions';
import type { OfferWithItems, TradeOpportunity } from '../../schemas';
import type { OfferItemRow, ListingItemRow } from '@tcg-trade-hub/database';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type DetailTab = 'offers' | 'opportunities';

/**
 * Owner-facing listing detail screen with map and bottom sheet
 * showing received offers and trade opportunities.
 * Supports stacked sheets for offer detail and card detail views.
 */
const MyListingDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const flatListRef = useRef<BottomSheetFlatListMethods>(null);

  const [selectedOffer, setSelectedOffer] = useState<OfferWithItems | null>(null);
  const [detailTab, setDetailTab] = useState<DetailTab>('opportunities');
  const [showLocationEditor, setShowLocationEditor] = useState(false);
  const [editingCoords, setEditingCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [editingName, setEditingName] = useState('');

  const { data: listing, isLoading: isListingLoading } = useListingDetail(id ?? '');
  const { data: offerData, isLoading: isOffersLoading } = useListingOffers(id ?? '');
  const { data: opportunities, isLoading: isOpportunitiesLoading } = useTradeOpportunities(id ?? '');
  const respondToOffer = useRespondToOffer();
  const deleteListing = useDeleteListing();
  const updateLocation = useUpdateListingLocation();
  useRealtimeOfferUpdates(id ?? '');

  // Parse listing location for the map marker
  const listingCoords = useMemo(
    () => (listing ? parseLocationCoords((listing as Record<string, unknown>).location) : null),
    [listing],
  );
  const listingLocationName = (listing as Record<string, unknown> | undefined)?.location_name as string | undefined;

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

  const handleAccept = useCallback(
    (offerId: string) => {
      if (!id) return;
      respondToOffer.mutate({
        offerId,
        listingId: id,
        action: 'accepted',
      });
    },
    [id, respondToOffer],
  );

  const handleDecline = useCallback(
    (offerId: string) => {
      if (!id) return;
      respondToOffer.mutate({
        offerId,
        listingId: id,
        action: 'declined',
      });
    },
    [id, respondToOffer],
  );

  const handleOfferPress = useCallback((offer: OfferWithItems) => {
    setSelectedOffer(offer);
    bottomSheetRef.current?.snapToIndex(2);
  }, []);

  const handleOfferDetailBack = useCallback(() => {
    setSelectedOffer(null);
  }, []);

  const navigateToCardDetail = useCallback(
    (card: { card_name: string; card_image_url: string; card_external_id: string; tcg: string; card_set: string | null; card_number: string | null; condition: string; market_price: number | null; card_rarity?: string | null }) => {
      router.push({
        pathname: '/(tabs)/(listings)/listing-card-detail',
        params: {
          cardExternalId: card.card_external_id,
          cardName: card.card_name,
          cardImageUrl: card.card_image_url,
          tcg: card.tcg,
          cardSet: card.card_set ?? '',
          cardNumber: card.card_number ?? '',
          condition: card.condition,
          marketPrice: card.market_price != null ? String(card.market_price) : '',
          cardRarity: card.card_rarity ?? '',
        },
      });
    },
    [router],
  );

  const handleOfferCardPress = useCallback(
    (item: OfferItemRow) => navigateToCardDetail(item),
    [navigateToCardDetail],
  );

  const handleListingCardPress = useCallback(
    (item: ListingItemRow) => navigateToCardDetail(item),
    [navigateToCardDetail],
  );

  // --- Trade opportunity handlers ---

  const handleMatch = useCallback((opportunity: TradeOpportunity) => {
    // Navigate to trade builder with match mode (auto-filled)
    router.push(
      `/(tabs)/(listings)/trade-builder?myListingId=${id}&theirListingId=${opportunity.listing.id}&mode=match`,
    );
  }, [id, router]);

  const handleOffer = useCallback((opportunity: TradeOpportunity) => {
    router.push(
      `/(tabs)/(listings)/trade-builder?myListingId=${id}&theirListingId=${opportunity.listing.id}&mode=offer`,
    );
  }, [id, router]);

  // Map region from shops + listing location
  const initialRegion = useMemo(() => {
    const shops = offerData?.shops ?? [];
    const shopPoints = shops
      .filter((s) => s.lat !== 0 || s.lng !== 0)
      .map((s) => ({ lat: s.lat, lng: s.lng }));

    // Include listing location point
    const allPoints = [...shopPoints];
    if (listingCoords) {
      allPoints.push({ lat: listingCoords.latitude, lng: listingCoords.longitude });
    }

    if (allPoints.length === 0) {
      return {
        latitude: 37.7749,
        longitude: -122.4194,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };
    }

    const lats = allPoints.map((p) => p.lat);
    const lngs = allPoints.map((p) => p.lng);
    const latDelta = Math.max((Math.max(...lats) - Math.min(...lats)) * 1.5, 0.02);
    const lngDelta = Math.max((Math.max(...lngs) - Math.min(...lngs)) * 1.5, 0.02);

    return {
      latitude: (Math.min(...lats) + Math.max(...lats)) / 2,
      longitude: (Math.min(...lngs) + Math.max(...lngs)) / 2,
      latitudeDelta: latDelta,
      longitudeDelta: lngDelta,
    };
  }, [offerData, listingCoords]);

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

  const offers = offerData?.offers ?? [];
  const shops = offerData?.shops ?? [];
  const offerCount = offers.length;
  const opportunityCount = opportunities?.length ?? 0;

  const tabItems = [
    { value: 'opportunities' as DetailTab, label: 'Opportunities', count: opportunityCount },
    { value: 'offers' as DetailTab, label: 'Offers', count: offerCount },
  ];

  const renderOfferItem = ({ item }: { item: OfferWithItems }) => (
    <ReceivedOfferCard
      offer={item}
      onAccept={handleAccept}
      onDecline={handleDecline}
      isResponding={respondToOffer.isPending}
      onPress={handleOfferPress}
    />
  );

  const renderOpportunityItem = ({ item }: { item: TradeOpportunity }) => (
    <TradeOpportunityCard
      opportunity={item}
      onMatch={handleMatch}
      onOffer={handleOffer}
    />
  );

  const renderListHeader = () => (
    <>
      <MyBundleSummary listing={listing} onCardPress={handleListingCardPress} />
      {__DEV__ && <DevListingActions listingId={id ?? ''} />}
      <SegmentedFilter
        items={tabItems}
        value={detailTab}
        onValueChange={setDetailTab}
        className="mx-4"
      />
    </>
  );

  const renderOffersContent = () => {
    if (isOffersLoading) {
      return (
        <View className="gap-3 px-4 pt-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={`skel-${i}`} className="h-28 w-full rounded-xl" />
          ))}
        </View>
      );
    }

    if (offerCount === 0) {
      return (
        <View className="items-center px-4 py-10">
          <Text className="text-center text-sm text-muted-foreground">
            No offers received yet.{'\n'}Share your listing to attract offers.
          </Text>
        </View>
      );
    }

    return null; // FlatList handles rendering
  };

  const renderOpportunitiesContent = () => {
    if (isOpportunitiesLoading) {
      return (
        <View className="gap-3 px-4 pt-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={`opp-skel-${i}`} className="h-28 w-full rounded-xl" />
          ))}
        </View>
      );
    }

    if (opportunityCount === 0) {
      return (
        <View className="items-center px-4 py-10">
          <Text className="text-center text-sm text-muted-foreground">
            No trade opportunities found yet.{'\n'}Add trade wants to your listing to find matches.
          </Text>
        </View>
      );
    }

    return null; // FlatList handles rendering
  };

  const showOffersList = detailTab === 'offers' && offerCount > 0 && !isOffersLoading;
  const showOpportunitiesList = detailTab === 'opportunities' && opportunityCount > 0 && !isOpportunitiesLoading;

  return (
    <View className="flex-1 bg-background">
      <MapView
        style={{ width: SCREEN_WIDTH, flex: 1 }}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {shops.map((shop) => (
          <ShopMarker key={`shop-${shop.id}`} shop={shop} />
        ))}
        {listingCoords && (
          <Marker
            coordinate={listingCoords}
            title={listing.title}
            description={listingLocationName ?? 'Listing location'}
            onCalloutPress={() => {
              setEditingCoords(listingCoords);
              setEditingName(listingLocationName ?? '');
              setShowLocationEditor(true);
            }}
          >
            <MapPin size={28} color="#3b82f6" fill="#3b82f6" />
          </Marker>
        )}
      </MapView>

      {/* Location edit modal */}
      <Modal
        visible={showLocationEditor}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowLocationEditor(false)}
      >
        <SafeAreaView className="flex-1 bg-background" edges={['top']}>
          <View className="flex-row items-center border-b border-border px-4 py-3">
            <Pressable onPress={() => setShowLocationEditor(false)} className="mr-3 p-1">
              <ArrowLeft size={24} className="text-foreground" />
            </Pressable>
            <Text className="text-lg font-semibold text-foreground">Edit Location</Text>
          </View>
          <View className="flex-1 px-4 pt-4">
            <LocationPicker
              initialLocation={editingCoords}
              initialLocationName={editingName}
              onLocationChange={(coords, name) => {
                setEditingCoords(coords);
                setEditingName(name);
              }}
              mapHeight={300}
            />
            <View className="mt-4">
              <Button
                size="lg"
                onPress={() => {
                  if (editingCoords && id) {
                    updateLocation.mutate(
                      { listingId: id, coords: editingCoords, locationName: editingName },
                      {
                        onSuccess: () => {
                          setShowLocationEditor(false);
                          Alert.alert('Updated', 'Listing location has been updated.');
                        },
                      },
                    );
                  }
                }}
                disabled={updateLocation.isPending}
                className="w-full"
              >
                <Text className="text-base font-semibold text-primary-foreground">
                  {updateLocation.isPending ? 'Saving...' : 'Save Location'}
                </Text>
              </Button>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Header */}
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
            {listing.title}
          </Text>

          <View className="flex-row gap-1">
            <Pressable
              onPress={() => {
                setEditingCoords(listingCoords);
                setEditingName(listingLocationName ?? '');
                setShowLocationEditor(true);
              }}
              className="p-2"
            >
              <MapPin size={18} className="text-muted-foreground" />
            </Pressable>
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

      {/* Main bottom sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        index={1}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        enablePanDownToClose={false}
        backgroundStyle={{ borderRadius: 20, backgroundColor: '#0f0f13' }}
        handleIndicatorStyle={{ backgroundColor: '#a1a1aa', width: 40 }}
      >
        {selectedOffer ? (
          <BottomSheetScrollView contentContainerStyle={{ paddingBottom: 40 }}>
            <OfferDetailView
              offer={selectedOffer}
              onBack={handleOfferDetailBack}
              onAccept={handleAccept}
              onDecline={handleDecline}
              isResponding={respondToOffer.isPending}
              onCardPress={handleOfferCardPress}
            />
          </BottomSheetScrollView>
        ) : showOffersList ? (
          <BottomSheetFlatList
            ref={flatListRef}
            data={offers}
            keyExtractor={(item: OfferWithItems) => item.id}
            renderItem={renderOfferItem}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListHeaderComponent={renderListHeader}
          />
        ) : showOpportunitiesList ? (
          <BottomSheetFlatList
            data={opportunities ?? []}
            keyExtractor={(item: TradeOpportunity) => item.listing.id}
            renderItem={renderOpportunityItem}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListHeaderComponent={renderListHeader}
          />
        ) : (
          <BottomSheetScrollView>
            {renderListHeader()}
            {detailTab === 'offers' ? renderOffersContent() : renderOpportunitiesContent()}
          </BottomSheetScrollView>
        )}
      </BottomSheet>
    </View>
  );
};

export default MyListingDetailScreen;
