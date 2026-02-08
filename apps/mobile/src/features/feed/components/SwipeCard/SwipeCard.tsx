import React, { useState } from 'react';
import { View, Text, Image, Dimensions, ScrollView } from 'react-native';
import { cn } from '@/lib/cn';
import Badge from '@/components/ui/Badge/Badge';
import type { ListingWithDistance } from '../../schemas';
import formatDistance from '../../utils/formatDistance/formatDistance';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const LISTING_TYPE_CONFIG = {
  wts: { label: 'WTS', color: 'bg-emerald-600' },
  wtb: { label: 'WTB', color: 'bg-blue-600' },
  wtt: { label: 'WTT', color: 'bg-amber-600' },
} as const;

const CONDITION_LABELS: Record<string, string> = {
  nm: 'Near Mint',
  lp: 'Lightly Played',
  mp: 'Moderately Played',
  hp: 'Heavily Played',
  dmg: 'Damaged',
};

export type SwipeCardProps = {
  listing: ListingWithDistance;
  className?: string;
};

/**
 * Full-screen card for the swipe view.
 *
 * Shows: card_image_url as large image, card_name, card_set, condition badge,
 * listing type badge (WTS/WTB/WTT with colors), asking_price if WTS,
 * distance. Includes a horizontal photo gallery with dots indicator when
 * multiple photos exist.
 */
const SwipeCard = ({ listing, className }: SwipeCardProps) => {
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const typeConfig = LISTING_TYPE_CONFIG[listing.type];

  const allPhotos = listing.photos.length > 0
    ? listing.photos
    : [listing.card_image_url];

  const handleScroll = (event: { nativeEvent: { contentOffset: { x: number } } }) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setActivePhotoIndex(index);
  };

  return (
    <View
      className={cn(
        'flex-1 overflow-hidden rounded-2xl border border-border bg-card',
        className,
      )}
    >
      {/* Photo gallery */}
      <View className="relative">
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          className="h-[60%]"
        >
          {allPhotos.map((uri, index) => (
            <Image
              key={`photo-${index}`}
              source={{ uri }}
              className="bg-muted"
              style={{ width: SCREEN_WIDTH - 32, height: '100%' }}
              resizeMode="contain"
            />
          ))}
        </ScrollView>

        {/* Photo dots indicator */}
        {allPhotos.length > 1 && (
          <View className="absolute bottom-3 left-0 right-0 flex-row items-center justify-center gap-1.5">
            {allPhotos.map((_, index) => (
              <View
                key={`dot-${index}`}
                className={cn(
                  'h-2 w-2 rounded-full',
                  index === activePhotoIndex ? 'bg-primary' : 'bg-white/50',
                )}
              />
            ))}
          </View>
        )}

        {/* Type badge overlay */}
        <View className={cn('absolute left-3 top-3 rounded-full px-3 py-1.5', typeConfig.color)}>
          <Text className="text-sm font-bold text-white">{typeConfig.label}</Text>
        </View>
      </View>

      {/* Card info */}
      <View className="flex-1 p-4">
        <Text className="text-2xl font-bold text-card-foreground" numberOfLines={2}>
          {listing.card_name}
        </Text>

        <Text className="mt-1 text-sm text-muted-foreground">
          {listing.card_set}
        </Text>

        <View className="mt-3 flex-row items-center gap-2">
          <Badge variant="outline">
            {CONDITION_LABELS[listing.condition] ?? listing.condition}
          </Badge>
          <Text className="text-xs text-muted-foreground">
            {formatDistance(listing.distance_km)}
          </Text>
        </View>

        {listing.type === 'wts' && listing.asking_price != null && (
          <Text className="mt-3 text-xl font-bold text-foreground">
            ${listing.asking_price.toFixed(2)}
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
