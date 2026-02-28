import React, { useMemo } from 'react';
import { View, Text, ScrollView, Image, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, PackageOpen } from 'lucide-react-native';
import type { TcgType } from '@tcg-trade-hub/database';

import { cardDataService } from '@/services/cardData';
import type { CardDetail, PriceVariant } from '@/services/cardData/types';
import ListingCard from '../ListingCard/ListingCard';
import useCardListings from '../../hooks/useCardListings/useCardListings';

const CONDITION_LABELS = ['NM', 'LP', 'MP', 'HP', 'DMG'] as const;

/**
 * Formats a price as a dollar string, or returns null if the price is null.
 */
const formatPrice = (price: number | null): string | null => {
  if (price === null) return null;
  return `$${price.toFixed(2)}`;
};

/**
 * Full card detail page showing card info, market price, condition prices,
 * and all active listings containing this card (singles + bundles).
 */
const CardDetailScreen = () => {
  const router = useRouter();
  const { externalId, tcg } = useLocalSearchParams<{
    externalId: string;
    tcg?: string;
  }>();

  const { data: cardDetail, isLoading: isCardLoading } = useQuery<CardDetail | null, Error>({
    queryKey: ['card-detail', externalId],
    queryFn: () => cardDataService.getCardDetail(externalId),
    enabled: !!externalId,
    staleTime: 1000 * 60 * 30,
  });

  const { data: listings, isLoading: isListingsLoading } = useCardListings(externalId);

  const priceVariants = useMemo(() => {
    if (!cardDetail?.prices?.variants) return [];
    return Object.entries(cardDetail.prices.variants)
      .filter(([, v]) => v.market !== null)
      .map(([name, v]) => ({ name, ...v }));
  }, [cardDetail?.prices?.variants]);

  const isLoading = isCardLoading || isListingsLoading;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3">
        <Pressable onPress={() => router.back()} className="p-1">
          <ArrowLeft size={22} className="text-foreground" />
        </Pressable>
        <Text className="ml-3 flex-1 text-lg font-semibold text-foreground" numberOfLines={1}>
          {cardDetail?.name ?? 'Card Detail'}
        </Text>
        {tcg && (
          <View className="rounded-full bg-primary/10 px-2.5 py-1">
            <Text className="text-xs font-medium uppercase text-primary">
              {tcg}
            </Text>
          </View>
        )}
      </View>

      {isCardLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
        </View>
      ) : !cardDetail ? (
        <View className="flex-1 items-center justify-center px-8">
          <PackageOpen size={48} className="text-muted-foreground" />
          <Text className="mt-4 text-center text-lg font-semibold text-foreground">
            Card Not Found
          </Text>
          <Text className="mt-2 text-center text-sm text-muted-foreground">
            We couldn't find details for this card.
          </Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Card Image */}
          <View className="items-center px-4 pt-2">
            <Image
              source={{ uri: cardDetail.largeImageUrl }}
              className="h-80 w-56 rounded-xl"
              resizeMode="contain"
            />
          </View>

          {/* Metadata */}
          <View className="mt-4 items-center px-4">
            <Text className="text-center text-sm text-muted-foreground">
              {cardDetail.setName} · #{cardDetail.number}
              {cardDetail.rarity ? ` · ${cardDetail.rarity}` : ''}
            </Text>
          </View>

          {/* Market Price */}
          {cardDetail.marketPrice !== null && (
            <View className="mt-3 items-center">
              <Text className="text-3xl font-bold text-foreground">
                {formatPrice(cardDetail.marketPrice)}
              </Text>
              <Text className="mt-0.5 text-xs text-muted-foreground">
                Market Price
              </Text>
            </View>
          )}

          {/* Condition Price Variants */}
          {priceVariants.length > 0 && (
            <View className="mt-4 px-4">
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8 }}
              >
                {priceVariants.map((variant) => (
                  <View
                    key={variant.name}
                    className="items-center rounded-lg border border-border bg-card px-4 py-2.5"
                  >
                    <Text className="text-xs font-medium uppercase text-muted-foreground">
                      {variant.name}
                    </Text>
                    <Text className="mt-0.5 text-sm font-semibold text-foreground">
                      {formatPrice(variant.market)}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Trend + Average */}
          {cardDetail.prices && (
            <View className="mt-3 flex-row justify-center gap-6 px-4">
              {cardDetail.prices.trendPrice !== null && (
                <View className="items-center">
                  <Text className="text-xs text-muted-foreground">Trend</Text>
                  <Text className="text-sm font-medium text-foreground">
                    {formatPrice(cardDetail.prices.trendPrice)}
                  </Text>
                </View>
              )}
              {cardDetail.prices.averageSellPrice !== null && (
                <View className="items-center">
                  <Text className="text-xs text-muted-foreground">Avg Sell</Text>
                  <Text className="text-sm font-medium text-foreground">
                    {formatPrice(cardDetail.prices.averageSellPrice)}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Listings Sections */}
          {isListingsLoading ? (
            <View className="mt-8 items-center">
              <ActivityIndicator />
              <Text className="mt-2 text-sm text-muted-foreground">
                Loading listings...
              </Text>
            </View>
          ) : (
            <View className="mt-6">
              {/* Singles */}
              <View className="px-4">
                <Text className="text-base font-semibold text-foreground">
                  Singles{listings?.singles.length ? ` (${listings.singles.length})` : ''}
                </Text>
              </View>
              {listings && listings.singles.length > 0 ? (
                <View className="mt-2 gap-3 px-4">
                  {listings.singles.map((listing) => (
                    <ListingCard
                      key={listing.id}
                      listing={listing}
                      detailBasePath="/(tabs)/(discover)"
                    />
                  ))}
                </View>
              ) : (
                <View className="mt-2 items-center py-4">
                  <Text className="text-sm text-muted-foreground">
                    No single card listings found.
                  </Text>
                </View>
              )}

              {/* Bundles */}
              <View className="mt-6 px-4">
                <Text className="text-base font-semibold text-foreground">
                  In Bundles{listings?.bundles.length ? ` (${listings.bundles.length})` : ''}
                </Text>
              </View>
              {listings && listings.bundles.length > 0 ? (
                <View className="mt-2 gap-3 px-4">
                  {listings.bundles.map((listing) => (
                    <ListingCard
                      key={listing.id}
                      listing={listing}
                      detailBasePath="/(tabs)/(discover)"
                    />
                  ))}
                </View>
              ) : (
                <View className="mt-2 items-center py-4">
                  <Text className="text-sm text-muted-foreground">
                    No bundles containing this card.
                  </Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default CardDetailScreen;
