import React from 'react';
import { View, Text, Image } from 'react-native';
import { cn } from '@/lib/cn';
import { ListingTypeBadge } from '@/features/listings';
import BundlePreview from '@/features/listings/components/BundlePreview/BundlePreview';
import type { ListingWithDistance } from '../../schemas';
import formatDistance from '../../utils/formatDistance/formatDistance';

const TCG_LABELS: Record<string, string> = {
  pokemon: 'Pokemon',
  mtg: 'Magic: The Gathering',
  yugioh: 'Yu-Gi-Oh!',
};

export type SwipeCardProps = {
  listing: ListingWithDistance;
  className?: string;
};

/**
 * Full-screen card for the swipe view showing bundle preview.
 */
const SwipeCard = ({ listing, className }: SwipeCardProps) => {
  const items = listing.items ?? [];
  const firstItem = items[0];
  const heroImage = firstItem?.card_image_url ?? '';

  return (
    <View
      className={cn(
        'flex-1 overflow-hidden rounded-2xl border border-border bg-card',
        className,
      )}
    >
      {/* Hero image from first item */}
      {heroImage ? (
        <View className="relative h-[55%]">
          <Image
            source={{ uri: heroImage }}
            className="h-full w-full bg-muted"
            resizeMode="contain"
          />
          <ListingTypeBadge type={listing.type} className="absolute left-3 top-3 px-3 py-1.5" />
        </View>
      ) : (
        <View className="h-[55%] items-center justify-center bg-muted">
          <Text className="text-muted-foreground">No image</Text>
        </View>
      )}

      {/* Card info */}
      <View className="flex-1 p-4">
        {/* Bundle thumbnail row */}
        {items.length > 1 && (
          <BundlePreview items={items} size="sm" className="mb-3" />
        )}

        <Text className="text-2xl font-bold text-card-foreground" numberOfLines={2}>
          {listing.title}
        </Text>

        <Text className="mt-1 text-sm text-muted-foreground">
          {TCG_LABELS[listing.tcg] ?? listing.tcg} &middot; {items.length} card{items.length !== 1 ? 's' : ''}
        </Text>

        <View className="mt-3 flex-row items-center gap-2">
          <Text className="text-xs text-muted-foreground">
            {formatDistance(listing.distance_km)}
          </Text>
        </View>

        {listing.cash_amount > 0 && (
          <Text className="mt-3 text-xl font-bold text-foreground">
            ${listing.cash_amount.toFixed(2)}
          </Text>
        )}

        {listing.description && (
          <Text className="mt-2 text-sm text-muted-foreground" numberOfLines={3}>
            {listing.description}
          </Text>
        )}
      </View>
    </View>
  );
};

export default SwipeCard;
