import React, { useState, useCallback } from 'react';
import { View, Text } from 'react-native';
import { Image } from 'expo-image';
import { ImageOff } from 'lucide-react-native';
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
  const [heroError, setHeroError] = useState(false);
  const handleHeroError = useCallback(() => setHeroError(true), []);
  const showHero = heroImage.length > 0 && !heroError;

  return (
    <View
      className={cn(
        'flex-1 overflow-hidden rounded-2xl border border-border bg-card',
        className,
      )}
    >
      {/* Hero image from first item */}
      {showHero ? (
        <View className="relative h-[55%]">
          <Image
            source={{ uri: heroImage }}
            className="h-full w-full bg-muted"
            contentFit="contain"
            cachePolicy="disk"
            transition={200}
            onError={handleHeroError}
          />
          <ListingTypeBadge type={listing.type} className="absolute left-3 top-3 px-3 py-1.5" />
        </View>
      ) : (
        <View className="relative h-[55%] items-center justify-center bg-muted">
          <ImageOff size={48} className="text-muted-foreground" />
          <ListingTypeBadge type={listing.type} className="absolute left-3 top-3 px-3 py-1.5" />
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
