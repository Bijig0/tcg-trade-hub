import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { Star } from 'lucide-react-native';
import { cn } from '@/lib/cn';
import { ListingTypeBadge } from '@/features/listings';
import BundlePreview from '@/features/listings/components/BundlePreview/BundlePreview';
import type { ListingWithDistance } from '../../schemas';
import { feedKeys } from '../../queryKeys';
import formatDistance from '../../utils/formatDistance/formatDistance';

export type ListingCardProps = {
  listing: ListingWithDistance;
  className?: string;
  /** Base path for listing detail navigation. Defaults to the Listings tab. */
  detailBasePath?: string;
};

/**
 * Compact card for the feed list view showing bundle preview.
 */
const ListingCard = ({ listing, className, detailBasePath = '/(tabs)/(listings)' }: ListingCardProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const items = listing.items ?? [];
  const handlePress = () => {
    queryClient.setQueryData(feedKeys.detail(listing.id), listing);
    router.push(`${detailBasePath}/listing/${listing.id}`);
  };

  return (
    <Pressable
      onPress={handlePress}
      className={cn(
        'flex-row rounded-xl border border-border bg-card p-3 active:bg-accent',
        className,
      )}
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
            <Text className="text-xs text-muted-foreground">
              {formatDistance(listing.distance_km)}
            </Text>
          </View>

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
    </Pressable>
  );
};

export default ListingCard;
