import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MapView from 'react-native-maps';
import BottomSheet, { BottomSheetFlatList, BottomSheetScrollView, type BottomSheetFlatListMethods } from '@gorhom/bottom-sheet';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react-native';

import Skeleton from '@/components/ui/Skeleton/Skeleton';
import SegmentedFilter from '@/components/ui/SegmentedFilter/SegmentedFilter';
import useListingDetail from '@/features/feed/hooks/useListingDetail/useListingDetail';
import useListingOffers from '../../hooks/useListingOffers/useListingOffers';
import useRespondToOffer from '../../hooks/useRespondToOffer/useRespondToOffer';
import useDeleteListing from '../../hooks/useDeleteListing/useDeleteListing';
import useRealtimeOfferUpdates from '../../hooks/useRealtimeOfferUpdates/useRealtimeOfferUpdates';
import useTradeOpportunities from '../../hooks/useTradeOpportunities/useTradeOpportunities';
import MyBundleSummary from '../MyBundleSummary/MyBundleSummary';
import ReceivedOfferCard from '../ReceivedOfferCard/ReceivedOfferCard';
import TradeOpportunityCard from '../TradeOpportunityCard/TradeOpportunityCard';
import ShopMarker from '../ShopMarker/ShopMarker';
import OfferDetailSheet from '../OfferDetailSheet/OfferDetailSheet';
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
  const offerDetailRef = useRef<BottomSheet>(null);

  const [selectedOffer, setSelectedOffer] = useState<OfferWithItems | null>(null);
  const [detailTab, setDetailTab] = useState<DetailTab>('offers');

  const { data: listing, isLoading: isListingLoading } = useListingDetail(id ?? '');
  const { data: offerData, isLoading: isOffersLoading } = useListingOffers(id ?? '');
  const { data: opportunities, isLoading: isOpportunitiesLoading } = useTradeOpportunities(id ?? '');
  const respondToOffer = useRespondToOffer();
  const deleteListing = useDeleteListing();
  useRealtimeOfferUpdates(id ?? '');

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

  // --- Stacked sheet handlers ---

  const handleOfferPress = useCallback((offer: OfferWithItems) => {
    setSelectedOffer(offer);
    offerDetailRef.current?.expand();
  }, []);

  const handleOfferDetailClose = useCallback(() => {
    setSelectedOffer(null);
  }, []);

  const handleOfferCardPress = useCallback((item: OfferItemRow) => {
    setSelectedCard({
      card_name: item.card_name,
      card_image_url: item.card_image_url,
      card_external_id: item.card_external_id,
      tcg: item.tcg,
      card_set: item.card_set,
      card_number: item.card_number,
      condition: item.condition,
      market_price: item.market_price,
    });
    cardDetailRef.current?.expand();
  }, []);

  const handleListingCardPress = useCallback((item: ListingItemRow) => {
    setSelectedCard({
      card_name: item.card_name,
      card_image_url: item.card_image_url,
      card_external_id: item.card_external_id,
      tcg: item.tcg,
      card_set: item.card_set,
      card_number: item.card_number,
      condition: item.condition,
      market_price: item.market_price,
      card_rarity: item.card_rarity,
    });
    cardDetailRef.current?.expand();
  }, []);

  const handleCardDetailClose = useCallback(() => {
    setSelectedCard(null);
  }, []);

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

  // Map region from shops
  const initialRegion = useMemo(() => {
    const shops = offerData?.shops ?? [];
    const shopPoints = shops
      .filter((s) => s.lat !== 0 || s.lng !== 0)
      .map((s) => ({ lat: s.lat, lng: s.lng }));

    if (shopPoints.length === 0) {
      return {
        latitude: 37.7749,
        longitude: -122.4194,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };
    }

    const lats = shopPoints.map((p) => p.lat);
    const lngs = shopPoints.map((p) => p.lng);
    const latDelta = Math.max((Math.max(...lats) - Math.min(...lats)) * 1.5, 0.02);
    const lngDelta = Math.max((Math.max(...lngs) - Math.min(...lngs)) * 1.5, 0.02);

    return {
      latitude: (Math.min(...lats) + Math.max(...lats)) / 2,
      longitude: (Math.min(...lngs) + Math.max(...lngs)) / 2,
      latitudeDelta: latDelta,
      longitudeDelta: lngDelta,
    };
  }, [offerData]);

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
    { value: 'offers' as DetailTab, label: 'Offers', count: offerCount },
    { value: 'opportunities' as DetailTab, label: 'Opportunities', count: opportunityCount },
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
      </MapView>

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
        {showOffersList ? (
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

      {/* Stacked: Offer detail sheet */}
      <OfferDetailSheet
        ref={offerDetailRef}
        offer={selectedOffer}
        onClose={handleOfferDetailClose}
        onAccept={handleAccept}
        onDecline={handleDecline}
        isResponding={respondToOffer.isPending}
        onCardPress={handleOfferCardPress}
      />

      {/* Stacked: Card detail sheet */}
      <CardDetailSheet
        ref={cardDetailRef}
        item={selectedCard}
        onClose={handleCardDetailClose}
      />
    </View>
  );
};

export default MyListingDetailScreen;
