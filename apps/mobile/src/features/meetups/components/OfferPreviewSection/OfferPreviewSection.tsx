import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';
import BundlePreview from '@/features/listings/components/BundlePreview/BundlePreview';
import type { ListingItemRow, OfferItemRow } from '@tcg-trade-hub/database';

type OfferPreviewSectionProps = {
  listingItems: ListingItemRow[];
  offerItems: OfferItemRow[];
  conversationId: string | null;
};

/**
 * Compact trade summary showing listing cards vs offer cards.
 * Tapping navigates to the full offer detail screen.
 */
const OfferPreviewSection = ({
  listingItems,
  offerItems,
  conversationId,
}: OfferPreviewSectionProps) => {
  const router = useRouter();

  if (listingItems.length === 0 && offerItems.length === 0) return null;

  const handlePress = () => {
    if (conversationId) {
      router.push(`/(tabs)/(messages)/offer-detail?conversationId=${conversationId}`);
    }
  };

  // Cast OfferItemRow to ListingItemRow shape for BundlePreview compatibility
  const offerItemsAsListingItems = offerItems.map((item) => ({
    ...item,
    listing_id: item.offer_id,
    asking_price: null,
    card_rarity: null,
  })) as unknown as ListingItemRow[];

  return (
    <View className="gap-2">
      <Text className="text-sm font-semibold text-foreground">Trade Summary</Text>
      <Pressable
        onPress={handlePress}
        disabled={!conversationId}
        className="flex-row items-center justify-between rounded-xl bg-muted/50 p-3 active:opacity-70"
      >
        <View className="flex-1">
          {listingItems.length > 0 && (
            <View className="gap-1">
              <Text className="text-[10px] font-medium uppercase text-muted-foreground">
                Listing
              </Text>
              <BundlePreview items={listingItems} size="sm" />
            </View>
          )}
        </View>

        <View className="mx-2">
          <ArrowRight size={16} className="text-muted-foreground" />
        </View>

        <View className="flex-1 items-end">
          {offerItemsAsListingItems.length > 0 && (
            <View className="items-end gap-1">
              <Text className="text-[10px] font-medium uppercase text-muted-foreground">
                Offer
              </Text>
              <BundlePreview items={offerItemsAsListingItems} size="sm" />
            </View>
          )}
        </View>
      </Pressable>
    </View>
  );
};

export default OfferPreviewSection;
