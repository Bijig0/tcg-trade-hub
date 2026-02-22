import React from 'react';
import { View, Text, Image, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Star, User, MapPin } from 'lucide-react-native';
import Avatar from '@/components/ui/Avatar/Avatar';
import Button from '@/components/ui/Button/Button';
import Badge from '@/components/ui/Badge/Badge';
import type { ListingType } from '@tcg-trade-hub/database';
import type { RelevantListing } from '../../schemas';

type RelevantListingCardProps = {
  listing: RelevantListing;
  ownerListingType: ListingType;
  onContact: (theirListingId: string) => void;
  isContacting: boolean;
};

const ACTION_LABELS: Record<ListingType, string> = {
  wts: 'Sell to them',
  wtb: 'Buy from them',
  wtt: 'Propose Trade',
};

const CONDITION_SHORT: Record<string, string> = {
  nm: 'NM',
  lp: 'LP',
  mp: 'MP',
  hp: 'HP',
  dmg: 'DMG',
};

/**
 * Card row in the bottom sheet list showing a relevant trader's listing
 * with owner info and quick action buttons.
 */
const RelevantListingCard = ({
  listing,
  ownerListingType,
  onContact,
  isContacting,
}: RelevantListingCardProps) => {
  const router = useRouter();
  const { owner } = listing;

  return (
    <View className="mx-4 mb-3 rounded-xl border border-border bg-card p-3">
      <View className="flex-row gap-3">
        {/* Card image */}
        <Image
          source={{ uri: listing.card_image_url }}
          className="h-16 w-11 rounded bg-muted"
          resizeMode="cover"
        />

        {/* Info section */}
        <View className="flex-1">
          <Text className="text-sm font-semibold text-card-foreground" numberOfLines={1}>
            {listing.card_name}
          </Text>

          <View className="mt-0.5 flex-row items-center gap-1.5">
            <Badge variant="outline">
              {CONDITION_SHORT[listing.condition] ?? listing.condition}
            </Badge>
            {listing.asking_price != null && (
              <Text className="text-sm font-bold text-foreground">
                ${listing.asking_price.toFixed(2)}
              </Text>
            )}
          </View>

          {/* Owner row */}
          <View className="mt-1.5 flex-row items-center gap-1.5">
            <Avatar
              uri={owner.avatar_url}
              fallback={owner.display_name.slice(0, 2).toUpperCase()}
              size="sm"
            />
            <Text className="text-xs text-muted-foreground" numberOfLines={1}>
              {owner.display_name}
            </Text>
            <View className="flex-row items-center gap-0.5">
              <Star size={10} className="text-yellow-500" fill="#eab308" />
              <Text className="text-xs text-muted-foreground">
                {owner.rating_score.toFixed(1)}
              </Text>
            </View>
            {listing.distance_km > 0 && (
              <View className="flex-row items-center gap-0.5">
                <MapPin size={10} className="text-muted-foreground" />
                <Text className="text-xs text-muted-foreground">
                  {listing.distance_km < 1
                    ? `${Math.round(listing.distance_km * 1000)}m`
                    : `${listing.distance_km.toFixed(1)}km`}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Quick action buttons */}
      <View className="mt-2.5 flex-row gap-2">
        <Button
          size="sm"
          className="flex-1"
          onPress={() => onContact(listing.id)}
          disabled={isContacting}
        >
          {isContacting ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text className="text-sm font-semibold text-primary-foreground">
              {ACTION_LABELS[ownerListingType]}
            </Text>
          )}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onPress={() => onContact(listing.id)}
          disabled={isContacting}
        >
          <View className="flex-row items-center gap-1">
            <MapPin size={14} className="text-foreground" />
            <Text className="text-sm font-semibold text-foreground">Meetup</Text>
          </View>
        </Button>

        <Pressable
          onPress={() => router.push(`/(tabs)/(listings)/user/${listing.user_id}`)}
          className="h-9 w-9 items-center justify-center rounded-lg border border-border"
        >
          <User size={14} className="text-muted-foreground" />
        </Pressable>
      </View>
    </View>
  );
};

export default RelevantListingCard;
