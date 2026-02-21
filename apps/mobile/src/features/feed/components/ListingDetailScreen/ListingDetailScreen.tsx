import React from 'react';
import { View, Text, Image, ScrollView, Pressable, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Star, Heart, User } from 'lucide-react-native';

import Badge from '@/components/ui/Badge/Badge';
import Avatar from '@/components/ui/Avatar/Avatar';
import Button from '@/components/ui/Button/Button';
import Skeleton from '@/components/ui/Skeleton/Skeleton';
import { ListingTypeBadge } from '@/features/listings';
import useListingDetail from '../../hooks/useListingDetail/useListingDetail';
import useRecordSwipe from '../../hooks/useRecordSwipe/useRecordSwipe';
import formatDistance from '../../utils/formatDistance/formatDistance';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CONDITION_LABELS: Record<string, string> = {
  nm: 'Near Mint',
  lp: 'Lightly Played',
  mp: 'Moderately Played',
  hp: 'Heavily Played',
  dmg: 'Damaged',
};

/**
 * Full listing detail screen.
 *
 * Shows all card info, all photos in a horizontal ScrollView, description,
 * owner profile snippet (avatar, name, rating, trade count), and an
 * "Interested" button that records a like swipe. Links to owner's profile.
 */
const ListingDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: listing, isLoading, error } = useListingDetail(id ?? '');
  const recordSwipe = useRecordSwipe();

  const handleInterested = () => {
    if (!listing) return;
    recordSwipe.mutate(
      { listingId: listing.id, direction: 'like' },
      {
        onSuccess: (response) => {
          if (response.match) {
            // Could navigate to chat or show match modal
          }
        },
      },
    );
  };

  const handleBack = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 gap-4 p-4">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-8 w-48 rounded" />
          <Skeleton className="h-5 w-32 rounded" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !listing) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <Text className="text-base text-muted-foreground">
          {error?.message ?? 'Listing not found'}
        </Text>
        <Pressable onPress={handleBack} className="mt-4">
          <Text className="text-sm font-medium text-primary">Go back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const allPhotos = listing.photos.length > 0 ? listing.photos : [listing.card_image_url];

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Navigation header */}
      <View className="flex-row items-center border-b border-border px-4 py-3">
        <Pressable onPress={handleBack} className="mr-3 p-1">
          <ArrowLeft size={24} className="text-foreground" />
        </Pressable>
        <Text className="flex-1 text-lg font-semibold text-foreground" numberOfLines={1}>
          {listing.card_name}
        </Text>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="pb-8">
        {/* Photo gallery */}
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          className="bg-muted"
        >
          {allPhotos.map((uri, index) => (
            <Image
              key={`detail-photo-${index}`}
              source={{ uri }}
              style={{ width: SCREEN_WIDTH, height: 320 }}
              resizeMode="contain"
              className="bg-muted"
            />
          ))}
        </ScrollView>

        {/* Photo count indicator */}
        {allPhotos.length > 1 && (
          <View className="flex-row items-center justify-center gap-1.5 py-2">
            {allPhotos.map((_, index) => (
              <View
                key={`indicator-${index}`}
                className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40"
              />
            ))}
          </View>
        )}

        {/* Card details */}
        <View className="px-4 pt-4">
          <View className="flex-row items-center gap-2">
            <ListingTypeBadge type={listing.type} long />
            <Badge variant="outline">
              {CONDITION_LABELS[listing.condition] ?? listing.condition}
            </Badge>
          </View>

          <Text className="mt-3 text-2xl font-bold text-foreground">
            {listing.card_name}
          </Text>

          <Text className="mt-1 text-sm text-muted-foreground">
            {listing.card_set} &middot; #{listing.card_number}
          </Text>

          {listing.card_rarity && (
            <Text className="mt-1 text-xs text-muted-foreground">
              Rarity: {listing.card_rarity}
            </Text>
          )}

          {/* Price section */}
          {listing.type === 'wts' && listing.asking_price != null && (
            <View className="mt-4 flex-row items-baseline gap-2">
              <Text className="text-2xl font-bold text-foreground">
                ${listing.asking_price.toFixed(2)}
              </Text>
              {listing.card_market_price != null && (
                <Text className="text-sm text-muted-foreground">
                  Market: ${listing.card_market_price.toFixed(2)}
                </Text>
              )}
            </View>
          )}

          {/* Distance */}
          {listing.distance_km > 0 && (
            <Text className="mt-2 text-sm text-muted-foreground">
              {formatDistance(listing.distance_km)} away
            </Text>
          )}

          {/* Description */}
          {listing.description && (
            <View className="mt-4">
              <Text className="mb-1 text-sm font-medium text-foreground">Notes</Text>
              <Text className="text-sm leading-5 text-muted-foreground">
                {listing.description}
              </Text>
            </View>
          )}

          {/* Owner section */}
          <View className="mt-6 rounded-xl border border-border bg-card p-4">
            <Text className="mb-3 text-sm font-medium text-muted-foreground">Listed by</Text>

            <Pressable
              onPress={() => router.push(`/(tabs)/(listings)/user/${listing.user_id}`)}
              className="flex-row items-center gap-3"
            >
              <Avatar
                uri={listing.owner.avatar_url}
                fallback={listing.owner.display_name.slice(0, 2).toUpperCase()}
                size="lg"
              />

              <View className="flex-1">
                <Text className="text-base font-semibold text-card-foreground">
                  {listing.owner.display_name}
                </Text>

                <View className="mt-1 flex-row items-center gap-2">
                  <View className="flex-row items-center gap-0.5">
                    <Star size={12} className="text-yellow-500" fill="#eab308" />
                    <Text className="text-xs text-muted-foreground">
                      {listing.owner.rating_score.toFixed(1)}
                    </Text>
                  </View>
                  <Text className="text-xs text-muted-foreground">
                    {listing.owner.total_trades} trades
                  </Text>
                </View>
              </View>

              <User size={16} className="text-muted-foreground" />
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Bottom action bar */}
      <View className="border-t border-border bg-background px-4 pb-6 pt-3">
        <Button
          size="lg"
          onPress={handleInterested}
          disabled={recordSwipe.isPending}
          className="w-full"
        >
          {recordSwipe.isPending ? (
            <ActivityIndicator color="white" />
          ) : (
            <View className="flex-row items-center gap-2">
              <Heart size={18} color="white" />
              <Text className="text-base font-semibold text-primary-foreground">
                I'm Interested
              </Text>
            </View>
          )}
        </Button>
      </View>
    </SafeAreaView>
  );
};

export default ListingDetailScreen;
