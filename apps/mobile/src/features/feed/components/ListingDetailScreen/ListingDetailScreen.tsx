import React, { useRef } from 'react';
import { View, Text, Image, ScrollView, RefreshControl, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Star, Handshake, User } from 'lucide-react-native';
import BottomSheet from '@gorhom/bottom-sheet';

import Badge from '@/components/ui/Badge/Badge';
import Avatar from '@/components/ui/Avatar/Avatar';
import RefreshableScreen from '@/components/ui/RefreshableScreen/RefreshableScreen';
import Skeleton from '@/components/ui/Skeleton/Skeleton';
import { ListingTypeBadge } from '@/features/listings';
import BundlePreview from '@/features/listings/components/BundlePreview/BundlePreview';
import OfferCreationSheet from '@/features/listings/components/OfferCreationSheet/OfferCreationSheet';
import useListingDetail from '../../hooks/useListingDetail/useListingDetail';
import { feedKeys } from '../../queryKeys';
import formatDistance from '../../utils/formatDistance/formatDistance';

const TCG_LABELS: Record<string, string> = {
  pokemon: 'Pokemon',
  mtg: 'Magic: The Gathering',
  yugioh: 'Yu-Gi-Oh!',
};

const CONDITION_LABELS: Record<string, string> = {
  nm: 'Near Mint',
  lp: 'Lightly Played',
  mp: 'Moderately Played',
  hp: 'Heavily Played',
  dmg: 'Damaged',
};

/**
 * Full listing detail screen for bundle-based listings.
 *
 * Shows bundle preview, all items with their details, description,
 * owner profile snippet, and a "Make Offer" button that opens the
 * OfferCreationSheet.
 */
const ListingDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: listing, isLoading, error } = useListingDetail(id ?? '');
  const bottomSheetRef = useRef<BottomSheet>(null);

  const handleMakeOffer = () => {
    if (!listing) return;
    bottomSheetRef.current?.snapToIndex(0);
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

  return (
    <RefreshableScreen queryKeys={[feedKeys.detail(id ?? '')]}>
      {({ onRefresh, isRefreshing }) => (
        <View className="flex-1">
          {/* Navigation header */}
          <View className="flex-row items-center border-b border-border px-4 py-3">
            <Pressable onPress={handleBack} className="mr-3 p-1">
              <ArrowLeft size={24} className="text-foreground" />
            </Pressable>
            <Text className="flex-1 text-lg font-semibold text-foreground" numberOfLines={1}>
              {listing.title}
            </Text>
          </View>

          <ScrollView
            className="flex-1"
            contentContainerClassName="pb-8"
            refreshControl={
              <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
            }
          >
            {/* Bundle preview header */}
            <View className="items-center bg-muted px-4 py-6">
              <BundlePreview items={listing.items} size="lg" />
            </View>

            {/* Listing details */}
            <View className="px-4 pt-4">
              <View className="flex-row items-center gap-2">
                <ListingTypeBadge type={listing.type} long />
                <Text className="text-xs text-muted-foreground">
                  {listing.items.length} card{listing.items.length !== 1 ? 's' : ''}
                </Text>
              </View>

              <Text className="mt-3 text-2xl font-bold text-foreground">
                {listing.title}
              </Text>

              <Text className="mt-1 text-sm text-muted-foreground">
                {TCG_LABELS[listing.tcg] ?? listing.tcg}
              </Text>

              {/* Price section */}
              {listing.cash_amount > 0 && (
                <View className="mt-4 flex-row items-baseline gap-2">
                  <Text className="text-2xl font-bold text-foreground">
                    ${listing.cash_amount.toFixed(2)}
                  </Text>
                  {listing.total_value > 0 && (
                    <Text className="text-sm text-muted-foreground">
                      Total value: ${listing.total_value.toFixed(2)}
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

              {/* Items list */}
              {listing.items.length > 0 && (
                <View className="mt-6">
                  <Text className="mb-3 text-sm font-medium text-foreground">
                    Cards in this bundle
                  </Text>
                  <View className="gap-3">
                    {listing.items.map((item, index) => (
                      <View
                        key={item.id ?? `item-${index}`}
                        className="flex-row rounded-xl border border-border bg-card p-3"
                      >
                        <Image
                          source={{ uri: item.card_image_url }}
                          className="h-20 w-14 rounded-lg bg-muted"
                          resizeMode="cover"
                        />
                        <View className="ml-3 flex-1 justify-between">
                          <View>
                            <Text className="text-base font-semibold text-card-foreground" numberOfLines={1}>
                              {item.card_name}
                            </Text>
                            {item.card_set && (
                              <Text className="text-xs text-muted-foreground" numberOfLines={1}>
                                {item.card_set}
                                {item.card_number ? ` #${item.card_number}` : ''}
                              </Text>
                            )}
                            {item.card_rarity && (
                              <Text className="mt-0.5 text-xs text-muted-foreground">
                                {item.card_rarity}
                              </Text>
                            )}
                          </View>
                          <View className="mt-1 flex-row items-center gap-2">
                            {item.condition && (
                              <Badge variant="outline">
                                {CONDITION_LABELS[item.condition] ?? item.condition}
                              </Badge>
                            )}
                            {item.asking_price != null && item.asking_price > 0 && (
                              <Text className="text-sm font-semibold text-foreground">
                                ${item.asking_price.toFixed(2)}
                              </Text>
                            )}
                            {item.market_price != null && item.market_price > 0 && (
                              <Text className="text-xs text-muted-foreground">
                                Mkt: ${item.market_price.toFixed(2)}
                              </Text>
                            )}
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
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
            <Pressable
              onPress={handleMakeOffer}
              className="h-14 w-full flex-row items-center justify-center gap-2 rounded-lg bg-amber-500 active:bg-amber-600"
            >
              <Handshake size={20} color="white" />
              <Text className="text-base font-bold text-white">
                Make Offer
              </Text>
            </Pressable>
          </View>

          {/* Offer creation sheet */}
          <OfferCreationSheet
            listing={listing}
            bottomSheetRef={bottomSheetRef}
          />
        </View>
      )}
    </RefreshableScreen>
  );
};

export default ListingDetailScreen;
