import React from 'react';
import { View, Text, Image, TextInput, Pressable } from 'react-native';
import { DollarSign } from 'lucide-react-native';
import Badge from '@/components/ui/Badge/Badge';
import Skeleton from '@/components/ui/Skeleton/Skeleton';
import useCardPriceData from '../../hooks/useCardPriceData/useCardPriceData';
import type { SelectedCard } from '../../schemas';

type BulkPricingStepProps = {
  selectedCards: SelectedCard[];
  onUpdatePrice: (externalId: string, price: string) => void;
  onSetAllToMarket: () => void;
};

/**
 * Step 3 for WTS — eBay-style pricing grid.
 *
 * Shows each selected card with market data (low/mid/high/market) and a
 * price input. "Match market" per card and "Match all to market" bulk button.
 */
const BulkPricingStep = ({
  selectedCards,
  onUpdatePrice,
  onSetAllToMarket,
}: BulkPricingStepProps) => {
  const externalIds = selectedCards.map((sc) => sc.card.externalId);
  const { priceMap, isLoading } = useCardPriceData(externalIds);

  // Calculate total asking price
  const totalAsking = selectedCards.reduce((sum, sc) => {
    const price = parseFloat(sc.askingPrice);
    return sum + (isNaN(price) ? 0 : price);
  }, 0);

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

      {/* Card pricing rows */}
      {selectedCards.map((sc) => {
        const detail = priceMap.get(sc.card.externalId);
        const defaultVariant = detail?.prices?.variants?.normal ??
          detail?.prices?.variants?.holofoil ??
          (detail?.prices?.variants
            ? Object.values(detail.prices.variants)[0]
            : null);

        return (
          <View
            key={sc.card.externalId}
            className="gap-2 rounded-xl border border-border bg-card p-3"
          >
            <View className="flex-row items-center gap-3">
              <Image
                source={{ uri: sc.card.imageUrl }}
                className="h-16 w-11 rounded-lg bg-muted"
                resizeMode="cover"
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
            </View>

            {/* Market data row */}
            {isLoading ? (
              <View className="flex-row gap-2">
                <Skeleton className="h-4 w-16 rounded" />
                <Skeleton className="h-4 w-16 rounded" />
                <Skeleton className="h-4 w-16 rounded" />
                <Skeleton className="h-4 w-16 rounded" />
              </View>
            ) : defaultVariant ? (
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
                {defaultVariant.market != null && (
                  <Text className="text-xs font-medium text-foreground">
                    Market: ${defaultVariant.market.toFixed(2)}
                  </Text>
                )}
              </View>
            ) : sc.card.marketPrice != null ? (
              <Text className="text-xs font-medium text-foreground">
                Market: ${sc.card.marketPrice.toFixed(2)}
              </Text>
            ) : null}

            {/* Price input + match market button */}
            <View className="flex-row items-center gap-2">
              <View className="flex-1 flex-row items-center rounded-lg border border-input bg-background px-3">
                <DollarSign size={16} className="text-muted-foreground" />
                <TextInput
                  value={sc.askingPrice}
                  onChangeText={(val) => onUpdatePrice(sc.card.externalId, val)}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  className="flex-1 py-2.5 text-base text-foreground"
                  placeholderTextColor="#a1a1aa"
                />
              </View>
              {sc.card.marketPrice != null && (
                <Pressable
                  onPress={() =>
                    onUpdatePrice(sc.card.externalId, sc.card.marketPrice!.toFixed(2))
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
