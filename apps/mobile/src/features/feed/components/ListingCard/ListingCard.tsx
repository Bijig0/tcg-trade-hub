import React from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Star } from 'lucide-react-native';
import { cn } from '@/lib/cn';
import Badge from '@/components/ui/Badge/Badge';
import { ListingTypeBadge } from '@/features/listings';
import type { ListingWithDistance } from '../../schemas';
import formatDistance from '../../utils/formatDistance/formatDistance';

const CONDITION_LABELS: Record<string, string> = {
  nm: 'NM',
  lp: 'LP',
  mp: 'MP',
  hp: 'HP',
  dmg: 'DMG',
};

export type ListingCardProps = {
  listing: ListingWithDistance;
  className?: string;
};

/**
 * Compact card for the feed list view.
 *
 * Displays card image thumbnail, card_name, set, condition badge, type badge,
 * price, distance, and owner name + rating. Pressable to navigate to the
 * listing detail screen.
 */
const ListingCard = ({ listing, className }: ListingCardProps) => {
  const router = useRouter();
  const handlePress = () => {
    router.push(`/(tabs)/(listings)/listing/${listing.id}`);
  };

  return (
    <Pressable
      onPress={handlePress}
      className={cn(
        'flex-row rounded-xl border border-border bg-card p-3 active:bg-accent',
        className,
      )}
    >
      <Image
        source={{ uri: listing.card_image_url }}
        className="h-24 w-16 rounded-lg bg-muted"
        resizeMode="cover"
      />

      <View className="ml-3 flex-1 justify-between">
        <View>
          <View className="flex-row items-center gap-2">
            <ListingTypeBadge type={listing.type} />
            <Badge variant="outline">{CONDITION_LABELS[listing.condition] ?? listing.condition}</Badge>
          </View>

          <Text className="mt-1 text-base font-semibold text-card-foreground" numberOfLines={1}>
            {listing.card_name}
          </Text>

          <Text className="text-xs text-muted-foreground" numberOfLines={1}>
            {listing.card_set}
          </Text>
        </View>

        <View className="mt-2 flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            {listing.asking_price != null && (
              <Text className="text-sm font-semibold text-foreground">
                ${listing.asking_price.toFixed(2)}
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
