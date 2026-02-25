import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react-native';
import Badge from '@/components/ui/Badge/Badge';
import PriceChart from '@/components/PriceChart/PriceChart';
import PriceTimePeriodSelector from '@/components/PriceTimePeriodSelector/PriceTimePeriodSelector';
import usePriceHistory from '../../hooks/usePriceHistory/usePriceHistory';
import type { CardDetail } from '@/services/cardData/types';

const TIME_PERIODS = ['1M', '3M', '6M', '12M', 'MAX'] as const;

type CardPricingDetailScreenProps = {
  detail: CardDetail;
  condition: string;
  onBack: () => void;
};

/**
 * Full card pricing detail view — rendered inline within BulkPricingStep.
 * Shows large image, price chart with time selectors, and price variants.
 */
const CardPricingDetailScreen = ({
  detail,
  condition,
  onBack,
}: CardPricingDetailScreenProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('3M');
  const { data: history } = usePriceHistory(detail.externalId, selectedPeriod);

  const marketPrice = detail.marketPrice ?? 0;
  const changePercent = history?.changePercent ?? 0;
  const isPositive = changePercent >= 0;
  const changeAmount = marketPrice * (changePercent / 100);

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View className="mb-4 flex-row items-center gap-2">
        <Pressable onPress={onBack} hitSlop={12}>
          <ArrowLeft size={20} className="text-foreground" />
        </Pressable>
        <Text className="flex-1 text-base font-semibold text-foreground" numberOfLines={1}>
          {detail.name}
        </Text>
      </View>

      {/* Large card image */}
      <View className="mb-4 items-center">
        <Image
          source={{ uri: detail.largeImageUrl }}
          className="h-72 w-48 rounded-xl bg-muted"
          contentFit="contain"
          cachePolicy="disk"
          transition={200}
        />
      </View>

      {/* Card info */}
      <View className="mb-4 gap-1">
        <Text className="text-lg font-bold text-foreground">{detail.name}</Text>
        <Text className="text-sm text-muted-foreground">
          {detail.setName} · #{detail.number}
        </Text>
        <View className="flex-row gap-2">
          {detail.rarity && <Badge variant="secondary">{detail.rarity}</Badge>}
          <Badge variant="outline">{condition.toUpperCase()}</Badge>
        </View>
      </View>

      {/* Current price + change */}
      <View className="mb-4 flex-row items-center gap-2">
        {isPositive ? (
          <TrendingUp size={18} color="#22c55e" />
        ) : (
          <TrendingDown size={18} color="#ef4444" />
        )}
        <Text className="text-xl font-bold text-foreground">
          ${marketPrice.toFixed(2)}
        </Text>
        <Text
          className={`text-sm font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}
        >
          ({isPositive ? '+' : ''}${changeAmount.toFixed(2)}, {isPositive ? '+' : ''}
          {changePercent.toFixed(2)}%)
        </Text>
      </View>

      {/* Full price chart */}
      {history && (
        <View className="mb-3">
          <PriceChart priceHistory={history} height={200} showLabels />
        </View>
      )}

      {/* Time period selector */}
      <View className="mb-5">
        <PriceTimePeriodSelector
          periods={[...TIME_PERIODS]}
          selected={selectedPeriod}
          onSelect={setSelectedPeriod}
        />
      </View>

      {/* Price variants table */}
      {detail.prices && (
        <View className="gap-3">
          <Text className="text-sm font-semibold text-foreground">
            Price Variants
          </Text>
          {Object.entries(detail.prices.variants).map(([variant, data]) => (
            <View
              key={variant}
              className="gap-1 rounded-lg border border-border bg-muted/30 p-3"
            >
              <Text className="text-xs font-semibold capitalize text-foreground">
                {variant}
              </Text>
              <View className="flex-row flex-wrap gap-x-4 gap-y-1">
                {data.low != null && (
                  <Text className="text-xs text-muted-foreground">
                    Low: ${data.low.toFixed(2)}
                  </Text>
                )}
                {data.mid != null && (
                  <Text className="text-xs text-muted-foreground">
                    Mid: ${data.mid.toFixed(2)}
                  </Text>
                )}
                {data.high != null && (
                  <Text className="text-xs text-muted-foreground">
                    High: ${data.high.toFixed(2)}
                  </Text>
                )}
                {data.market != null && (
                  <Text className="text-xs font-medium text-foreground">
                    Market: ${data.market.toFixed(2)}
                  </Text>
                )}
              </View>
            </View>
          ))}

          {/* Trend + average */}
          <View className="flex-row gap-4 pb-4">
            {detail.prices.trendPrice != null && (
              <Text className="text-xs text-muted-foreground">
                Trend: ${detail.prices.trendPrice.toFixed(2)}
              </Text>
            )}
            {detail.prices.averageSellPrice != null && (
              <Text className="text-xs text-muted-foreground">
                Avg Sell: ${detail.prices.averageSellPrice.toFixed(2)}
              </Text>
            )}
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default CardPricingDetailScreen;
