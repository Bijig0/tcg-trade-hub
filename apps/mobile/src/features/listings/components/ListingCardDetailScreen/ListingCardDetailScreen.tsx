import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import Badge from '@/components/ui/Badge/Badge';
import Button from '@/components/ui/Button/Button';
import PriceChart from '@/features/collection/components/PriceChart/PriceChart';
import useCardDetail from '@/features/collection/hooks/useCardDetail/useCardDetail';
import { CONDITION_LABELS, TCG_LABELS } from '@/config/constants';
import type { TcgType, CardCondition } from '@tcg-trade-hub/database';
import type { PriceVariant } from '@/services/cardData';

/**
 * Read-only card detail screen shown when tapping a card from a listing bundle.
 * Receives card info via route search params and fetches extended detail via useCardDetail.
 */
const ListingCardDetailScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{
    cardExternalId: string;
    cardName: string;
    cardImageUrl: string;
    tcg: string;
    cardSet: string;
    cardNumber: string;
    condition: string;
    marketPrice: string;
    cardRarity: string;
  }>();

  const { data: cardDetail, isLoading } = useCardDetail(params.cardExternalId ?? null);

  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const variantNames = useMemo(
    () => (cardDetail?.prices ? Object.keys(cardDetail.prices.variants) : []),
    [cardDetail],
  );
  const activeVariant = selectedVariant ?? variantNames[0] ?? null;

  const marketPrice = params.marketPrice ? parseFloat(params.marketPrice) : null;

  const currentMarketPrice = useMemo(() => {
    if (cardDetail?.prices && activeVariant) {
      return cardDetail.prices.variants[activeVariant]?.market ?? marketPrice ?? null;
    }
    return marketPrice ?? null;
  }, [cardDetail, activeVariant, marketPrice]);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center border-b border-border px-4 py-3">
        <Pressable onPress={() => router.back()} className="mr-3 p-1">
          <ArrowLeft size={24} className="text-foreground" />
        </Pressable>
        <Text className="flex-1 text-lg font-semibold text-foreground" numberOfLines={1}>
          {params.cardName}
        </Text>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="pb-8" showsVerticalScrollIndicator={false}>
        {/* Card image */}
        <View className="items-center px-4 pt-6">
          <Image
            source={{ uri: params.cardImageUrl }}
            className="h-72 w-48 rounded-xl bg-muted"
            contentFit="contain"
            cachePolicy="disk"
            transition={200}
          />
        </View>

        {/* Card header */}
        <Text className="mt-4 text-center text-xl font-bold text-foreground">
          {params.cardName}
        </Text>
        <Text className="mb-1 text-center text-sm text-muted-foreground">
          {params.cardSet ?? ''}{params.cardNumber ? ` #${params.cardNumber}` : ''}
        </Text>

        {/* Badges */}
        <View className="mb-4 flex-row flex-wrap justify-center gap-2 px-4">
          {params.cardRarity ? <Badge variant="secondary">{params.cardRarity}</Badge> : null}
          {params.tcg ? <Badge variant="outline">{TCG_LABELS[params.tcg as TcgType]}</Badge> : null}
          {params.condition ? (
            <Badge variant="secondary">
              {CONDITION_LABELS[params.condition as CardCondition] ?? params.condition}
            </Badge>
          ) : null}
        </View>

        {/* Loading state for card detail */}
        {isLoading && (
          <View className="items-center py-6">
            <ActivityIndicator />
          </View>
        )}

        {/* Price summary card */}
        {currentMarketPrice != null ? (
          <View className="mx-4 mb-4 rounded-xl bg-card p-4">
            <Text className="text-2xl font-bold text-foreground">
              ${currentMarketPrice.toFixed(2)}
            </Text>
            {cardDetail?.priceHistory ? (
              <View className="flex-row items-center gap-1">
                <Text
                  className={`text-sm font-medium ${
                    cardDetail.priceHistory.changePercent >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  {cardDetail.priceHistory.changePercent >= 0 ? '\u25B2' : '\u25BC'}
                  {` ${cardDetail.priceHistory.changePercent >= 0 ? '+' : ''}${cardDetail.priceHistory.changePercent.toFixed(1)}%`}
                </Text>
              </View>
            ) : null}

            {/* Variant selector tabs */}
            {variantNames.length > 1 ? (
              <View className="mt-3 flex-row flex-wrap gap-2">
                {variantNames.map((v) => (
                  <Button
                    key={v}
                    variant={activeVariant === v ? 'default' : 'outline'}
                    size="sm"
                    onPress={() => setSelectedVariant(v)}
                  >
                    <Text
                      className={`text-xs capitalize ${
                        activeVariant === v ? 'text-primary-foreground' : 'text-foreground'
                      }`}
                    >
                      {v}
                    </Text>
                  </Button>
                ))}
              </View>
            ) : null}
          </View>
        ) : null}

        {/* Price chart */}
        {cardDetail?.priceHistory ? (
          <View className="mx-4 mb-4">
            <PriceChart
              priceHistory={cardDetail.priceHistory}
              currentPrice={currentMarketPrice}
            />
          </View>
        ) : null}

        {/* Price variants grid */}
        {cardDetail?.prices ? (
          <View className="mx-4 mb-4 rounded-xl bg-card p-4">
            <Text className="mb-2 text-sm font-semibold text-foreground">Price Variants</Text>
            {Object.entries(cardDetail.prices.variants).map(([variant, prices]) => (
              <View key={variant} className="mb-2">
                <Text className="text-xs font-medium capitalize text-muted-foreground">{variant}</Text>
                <View className="flex-row gap-4">
                  {(['low', 'mid', 'high', 'market'] as const).map((key) => (
                    <View key={key}>
                      <Text className="text-xs text-muted-foreground">{key}</Text>
                      <Text className="text-sm font-medium text-foreground">
                        {(prices as PriceVariant)[key] != null
                          ? `$${(prices as PriceVariant)[key]!.toFixed(2)}`
                          : '-'}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
            {cardDetail.prices.trendPrice != null ? (
              <Text className="mt-1 text-xs text-muted-foreground">
                Trend: ${cardDetail.prices.trendPrice.toFixed(2)}
              </Text>
            ) : null}
          </View>
        ) : null}

        {/* Card metadata */}
        {cardDetail ? (
          <View className="mx-4 mb-4 rounded-xl bg-card p-4">
            <Text className="mb-2 text-sm font-semibold text-foreground">Card Info</Text>
            <View className="gap-1">
              {cardDetail.artist ? (
                <Text className="text-xs text-muted-foreground">Artist: {cardDetail.artist}</Text>
              ) : null}
              {cardDetail.hp ? (
                <Text className="text-xs text-muted-foreground">HP: {cardDetail.hp}</Text>
              ) : null}
              {cardDetail.types.length > 0 ? (
                <Text className="text-xs text-muted-foreground">
                  Types: {cardDetail.types.join(', ')}
                </Text>
              ) : null}
              {cardDetail.rarity ? (
                <Text className="text-xs text-muted-foreground">Rarity: {cardDetail.rarity}</Text>
              ) : null}
            </View>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ListingCardDetailScreen;
