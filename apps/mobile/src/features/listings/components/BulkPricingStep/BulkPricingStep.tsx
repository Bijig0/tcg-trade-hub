import React, { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { DollarSign, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react-native';
import Badge from '@/components/ui/Badge/Badge';
import Skeleton from '@/components/ui/Skeleton/Skeleton';
import PriceChart from '@/components/PriceChart/PriceChart';
import OfferInfoBanner from '../OfferInfoBanner/OfferInfoBanner';
import CardPricingDetailScreen from '../CardPricingDetailScreen/CardPricingDetailScreen';
import useCardPriceData from '../../hooks/useCardPriceData/useCardPriceData';
import type { SelectedCard } from '../../schemas';
import type { CardDetail } from '@/services/cardData/types';

type BulkPricingStepProps = {
  selectedCards: SelectedCard[];
  onUpdatePrice: (selectionId: string, price: string) => void;
  onSetAllToMarket: () => void;
};

/**
 * Step 3 for WTS — eBay-style pricing grid with mini price charts.
 *
 * Shows each selected card with market data (low/mid/high/market), a mini
 * price chart, and a price input. Cards are tappable for full detail view.
 * Includes "Open to all offers" info banner.
 */
const BulkPricingStep = ({
  selectedCards,
  onUpdatePrice,
  onSetAllToMarket,
}: BulkPricingStepProps) => {
  const externalIds = selectedCards.map((sc) => sc.card.externalId);
  const { priceMap, isLoading } = useCardPriceData(externalIds);
  const [viewingCard, setViewingCard] = useState<{
    detail: CardDetail;
    condition: string;
  } | null>(null);

  // Calculate total asking price
  const totalAsking = selectedCards.reduce((sum, sc) => {
    const price = parseFloat(sc.askingPrice);
    return sum + (isNaN(price) ? 0 : price);
  }, 0);

  // If viewing a card detail, render the detail screen inline
  if (viewingCard) {
    return (
      <CardPricingDetailScreen
        detail={viewingCard.detail}
        condition={viewingCard.condition}
        onBack={() => setViewingCard(null)}
      />
    );
  }

  return (
    <View className="gap-4">
      {/* Summary header */}
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-base text-muted-foreground">Set your prices</Text>
          <Text className="text-sm text-muted-foreground">
            {selectedCards.length} card{selectedCards.length !== 1 ? 's' : ''} &middot; Total: ${totalAsking.toFixed(2)}
          </Text>
        </View>
        <Pressable
          onPress={onSetAllToMarket}
          className="rounded-lg border border-primary bg-primary/10 px-3 py-1.5"
        >
          <Text className="text-xs font-medium text-primary">Match all to market</Text>
        </Pressable>
      </View>

      {/* Offer info banner */}
      <OfferInfoBanner />

      {/* Card pricing rows */}
      {selectedCards.map((sc) => {
        const detail = priceMap.get(sc.card.externalId);
        const defaultVariant = detail?.prices?.variants?.normal ??
          detail?.prices?.variants?.holofoil ??
          (detail?.prices?.variants
            ? Object.values(detail.prices.variants)[0]
            : null);

        const priceHistory = detail?.priceHistory ?? null;
        const changePercent = priceHistory?.changePercent ?? 0;
        const isPositive = changePercent >= 0;

        const handleCardPress = () => {
          if (detail) {
            setViewingCard({ detail, condition: sc.condition });
          }
        };

        return (
          <View
            key={sc.selectionId}
            className="gap-2 rounded-xl border border-border bg-card p-3"
          >
            {/* Tappable card info header */}
            <Pressable
              onPress={handleCardPress}
              className="flex-row items-center gap-3"
              disabled={!detail}
            >
              <Image
                source={{ uri: sc.card.imageUrl }}
                className="h-16 w-11 rounded-lg bg-muted"
                contentFit="cover"
                cachePolicy="disk"
                transition={150}
              />
              <View className="flex-1 gap-0.5">
                <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
                  {sc.card.name}
                </Text>
                <Text className="text-xs text-muted-foreground" numberOfLines={1}>
                  {sc.card.setName}
                </Text>
                <Badge variant="outline">{sc.condition.toUpperCase()}</Badge>
              </View>
              {detail && (
                <ChevronRight size={16} className="text-muted-foreground" />
              )}
            </Pressable>

            {/* Mini price chart (3M default) */}
            {!isLoading && priceHistory && priceHistory.points.length >= 2 && (
              <View className="overflow-hidden rounded-lg">
                <PriceChart priceHistory={priceHistory} height={80} />
              </View>
            )}

            {/* Market data row */}
            {isLoading ? (
              <View className="flex-row gap-2">
                <Skeleton className="h-4 w-16 rounded" />
                <Skeleton className="h-4 w-16 rounded" />
                <Skeleton className="h-4 w-16 rounded" />
                <Skeleton className="h-4 w-16 rounded" />
              </View>
            ) : defaultVariant ? (
              <View className="gap-1">
                <View className="flex-row flex-wrap gap-x-3 gap-y-1">
                  {defaultVariant.low != null && (
                    <Text className="text-xs text-muted-foreground">
                      Low: ${defaultVariant.low.toFixed(2)}
                    </Text>
                  )}
                  {defaultVariant.mid != null && (
                    <Text className="text-xs text-muted-foreground">
                      Mid: ${defaultVariant.mid.toFixed(2)}
                    </Text>
                  )}
                  {defaultVariant.high != null && (
                    <Text className="text-xs text-muted-foreground">
                      High: ${defaultVariant.high.toFixed(2)}
                    </Text>
                  )}
                </View>
                <View className="flex-row items-center gap-1.5">
                  {defaultVariant.market != null && (
                    <Text className="text-xs font-medium text-foreground">
                      Market: ${defaultVariant.market.toFixed(2)}
                    </Text>
                  )}
                  {priceHistory && changePercent !== 0 && (
                    <View className="flex-row items-center gap-0.5">
                      {isPositive ? (
                        <TrendingUp size={12} color="#22c55e" />
                      ) : (
                        <TrendingDown size={12} color="#ef4444" />
                      )}
                      <Text
                        className={`text-xs font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}
                      >
                        {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ) : sc.card.marketPrice != null ? (
              <Text className="text-xs font-medium text-foreground">
                Market: ${sc.card.marketPrice.toFixed(2)}
              </Text>
            ) : null}

            {/* Price input + match market button */}
            <View className="flex-row items-center gap-2">
              <View className="flex-1 flex-row items-center rounded-lg border border-input bg-background px-3 py-2.5">
                <DollarSign size={16} className="text-muted-foreground" />
                <TextInput
                  value={sc.askingPrice}
                  onChangeText={(val) => onUpdatePrice(sc.selectionId, val)}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  className="flex-1 text-base text-foreground"
                  placeholderTextColor="#a1a1aa"
                />
              </View>
              {sc.card.marketPrice != null && (
                <Pressable
                  onPress={() =>
                    onUpdatePrice(sc.selectionId, sc.card.marketPrice!.toFixed(2))
                  }
                  className="rounded-lg border border-border px-2.5 py-2.5"
                >
                  <Text className="text-xs text-muted-foreground">Match</Text>
                </Pressable>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
};

export default BulkPricingStep;
