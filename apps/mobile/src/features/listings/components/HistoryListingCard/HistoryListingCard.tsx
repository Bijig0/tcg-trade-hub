import React from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Clock } from 'lucide-react-native';
import Badge from '@/components/ui/Badge/Badge';
import type { BadgeVariant } from '@/components/ui/Badge/Badge';
import formatListingDate from '../../utils/formatListingDate/formatListingDate';
import type { MyListingWithMatch } from '../../schemas';
import type { ListingStatus } from '@tcg-trade-hub/database';

const LISTING_TYPE_CONFIG = {
  wts: { label: 'WTS', variant: 'default' as const },
  wtb: { label: 'WTB', variant: 'secondary' as const },
  wtt: { label: 'WTT', variant: 'outline' as const },
} as const;

const STATUS_BADGE_CONFIG: Record<
  Extract<ListingStatus, 'completed' | 'expired'>,
  { label: string; variant: BadgeVariant }
> = {
  completed: { label: 'Completed', variant: 'outline' },
  expired: { label: 'Removed', variant: 'destructive' },
};

type HistoryListingCardProps = {
  listing: MyListingWithMatch;
};

/**
 * Card component for listings in the History tab.
 *
 * Dimmed appearance, shows type + status badges, no delete button.
 */
const HistoryListingCard = ({ listing }: HistoryListingCardProps) => {
  const router = useRouter();
  const typeConfig = LISTING_TYPE_CONFIG[listing.type];
  const statusConfig =
    STATUS_BADGE_CONFIG[listing.status as 'completed' | 'expired'];

  return (
    <Pressable
      onPress={() => router.push(`/(tabs)/(listings)/listing/${listing.id}`)}
      className="mx-4 mb-3 flex-row rounded-xl border border-border bg-card p-3 opacity-60 active:bg-accent"
    >
      <Image
        source={{ uri: listing.card_image_url }}
        className="h-20 w-14 rounded-lg bg-muted"
        resizeMode="cover"
      />

      <View className="ml-3 flex-1 justify-between">
        <View>
          <View className="flex-row items-center gap-2">
            <Badge variant={typeConfig.variant}>{typeConfig.label}</Badge>
            {statusConfig && (
              <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
            )}
          </View>

          <Text
            className="mt-1 text-base font-semibold text-muted-foreground"
            numberOfLines={1}
          >
            {listing.card_name}
          </Text>

          {listing.asking_price != null && (
            <Text className="text-sm text-muted-foreground">
              ${listing.asking_price.toFixed(2)}
            </Text>
          )}
        </View>

        <View className="mt-1 flex-row items-center gap-1">
          <Clock size={10} className="text-muted-foreground" />
          <Text className="text-xs text-muted-foreground">
            {formatListingDate(listing.created_at)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

export default HistoryListingCard;
