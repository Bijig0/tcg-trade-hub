import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { Star, X, Send } from 'lucide-react-native';
import { ListingTypeBadge } from '@/features/listings';
import BundlePreview from '@/features/listings/components/BundlePreview/BundlePreview';
import { feedKeys } from '../../queryKeys';
import formatDistance from '../../utils/formatDistance/formatDistance';
import type { ListingWithDistance } from '../../schemas';

export type InterestedListingCardProps = {
  listing: ListingWithDistance;
  onMakeOffer: (listing: ListingWithDistance) => void;
  onUnlike: (listingId: string) => void;
};

/**
 * Compact card for the Interested tab showing a liked listing with
 * "Make Offer" CTA and an unlike (X) button.
 */
const InterestedListingCard = ({
  listing,
  onMakeOffer,
  onUnlike,
}: InterestedListingCardProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const items = listing.items ?? [];

  const handlePress = () => {
    queryClient.setQueryData(feedKeys.detail(listing.id), listing);
    router.push(`/(tabs)/(listings)/listing/${listing.id}`);
  };

  return (
    <Pressable
      onPress={handlePress}
      className="flex-row rounded-xl border border-border bg-card p-3 active:bg-accent"
    >
      <BundlePreview items={items} size="md" />

      <View className="ml-3 flex-1 justify-between">
        <View>
          <View className="flex-row items-center gap-2">
            <ListingTypeBadge type={listing.type} />
            <Text className="text-xs text-muted-foreground">
              {items.length} card{items.length !== 1 ? 's' : ''}
            </Text>
          </View>

          <Text className="mt-1 text-base font-semibold text-card-foreground" numberOfLines={1}>
            {listing.title}
          </Text>
        </View>

        <View className="mt-2 flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            {listing.cash_amount > 0 && (
              <Text className="text-sm font-semibold text-foreground">
                ${listing.cash_amount.toFixed(2)}
              </Text>
            )}
            <View className="flex-row items-center gap-1">
              <Text className="text-xs text-muted-foreground" numberOfLines={1}>
                {listing.owner.display_name}
              </Text>
              <Star size={10} className="text-yellow-500" fill="#eab308" />
              <Text className="text-xs text-muted-foreground">
                {listing.owner.rating_score.toFixed(1)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Action buttons */}
      <View className="ml-2 items-center justify-between">
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            onUnlike(listing.id);
          }}
          className="rounded-full p-1 active:bg-destructive/10"
          hitSlop={8}
        >
          <X size={16} className="text-muted-foreground" />
        </Pressable>

        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            onMakeOffer(listing);
          }}
          className="rounded-lg bg-primary px-2.5 py-1.5 active:bg-primary/80"
        >
          <View className="flex-row items-center gap-1">
            <Send size={12} color="white" />
            <Text className="text-xs font-semibold text-primary-foreground">Offer</Text>
          </View>
        </Pressable>
      </View>
    </Pressable>
  );
};

export default InterestedListingCard;
