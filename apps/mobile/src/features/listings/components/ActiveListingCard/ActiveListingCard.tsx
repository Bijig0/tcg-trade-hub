import React from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Trash2, Clock } from 'lucide-react-native';
import Badge from '@/components/ui/Badge/Badge';
import formatListingDate from '../../utils/formatListingDate/formatListingDate';
import type { MyListingWithMatch } from '../../schemas';

const LISTING_TYPE_CONFIG = {
  wts: { label: 'WTS', variant: 'default' as const },
  wtb: { label: 'WTB', variant: 'secondary' as const },
  wtt: { label: 'WTT', variant: 'outline' as const },
} as const;

type ActiveListingCardProps = {
  listing: MyListingWithMatch;
  onDelete: (listing: MyListingWithMatch) => void;
};

/**
 * Card component for listings in the Active tab.
 *
 * Shows type badge, card name, price, condition, date, and a delete button.
 */
const ActiveListingCard = ({ listing, onDelete }: ActiveListingCardProps) => {
  const router = useRouter();
  const typeConfig = LISTING_TYPE_CONFIG[listing.type];

  return (
    <Pressable
      onPress={() => router.push(`/(tabs)/(listings)/listing/${listing.id}`)}
      className="mx-4 mb-3 flex-row rounded-xl border border-border bg-card p-3 active:bg-accent"
    >
      <Image
        source={{ uri: listing.card_image_url }}
        className="h-20 w-14 rounded-lg bg-muted"
        resizeMode="cover"
      />

      <View className="ml-3 flex-1 justify-between">
        <View>
          <Badge variant={typeConfig.variant}>{typeConfig.label}</Badge>

          <Text
            className="mt-1 text-base font-semibold text-card-foreground"
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

      <Pressable
        onPress={() => onDelete(listing)}
        className="ml-2 items-center justify-center px-1"
        hitSlop={8}
      >
        <Trash2 size={18} className="text-destructive" />
      </Pressable>
    </Pressable>
  );
};

export default ActiveListingCard;
