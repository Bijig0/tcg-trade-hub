import React from 'react';
import { View, Text } from 'react-native';
import { Image } from 'expo-image';
import Badge from '@/components/ui/Badge/Badge';
import type { SelectedCard } from '../../schemas';
import type { ListingType } from '@tcg-trade-hub/database';

type BundleConfirmStepProps = {
  type: ListingType;
  selectedCards: SelectedCard[];
  cashAmount: string;
  description: string | null;
};

const TYPE_LABELS: Record<ListingType, string> = {
  wts: 'Want to Sell',
  wtb: 'Want to Buy',
  wtt: 'Want to Trade',
};

const CASH_LABELS: Record<ListingType, string> = {
  wts: 'Asking Price',
  wtb: 'Budget',
  wtt: 'Cash Sweetener',
};

/**
 * Unified review step for all listing types.
 * Shows bundle card grid, total value, cash amount, and description.
 */
const BundleConfirmStep = ({ type, selectedCards, cashAmount, description }: BundleConfirmStepProps) => {
  const totalItemValue = selectedCards.reduce((sum, sc) => {
    const price = type === 'wts' && sc.askingPrice
      ? parseFloat(sc.askingPrice)
      : (sc.card.marketPrice ?? 0);
    return sum + (isNaN(price) ? 0 : price);
  }, 0);

  const cash = parseFloat(cashAmount) || 0;
  const totalValue = totalItemValue + cash;

  return (
    <View className="gap-4">
      <View>
        <Text className="text-base font-medium text-foreground">
          Review your listing
        </Text>
        <Text className="mt-1 text-sm text-muted-foreground">
          {selectedCards.length} card{selectedCards.length !== 1 ? 's' : ''} &middot; {TYPE_LABELS[type]}
        </Text>
      </View>

      {/* Card grid */}
      {selectedCards.map((sc) => (
        <View
          key={sc.card.externalId}
          className="flex-row items-center gap-3 rounded-xl border border-border bg-card p-3"
        >
          <Image
            source={{ uri: sc.card.imageUrl }}
            className="h-20 w-14 rounded-lg bg-muted"
            contentFit="cover"
            cachePolicy="disk"
            transition={150}
          />
          <View className="flex-1 gap-1">
            <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
              {sc.card.name}
            </Text>
            <Text className="text-xs text-muted-foreground" numberOfLines={1}>
              {sc.card.setName}
            </Text>
            <View className="flex-row items-center gap-2">
              <Badge variant="default">{type.toUpperCase()}</Badge>
              <Badge variant="outline">{sc.condition.toUpperCase()}</Badge>
            </View>
            {type === 'wts' && sc.askingPrice ? (
              <Text className="mt-0.5 text-base font-semibold text-foreground">
                ${parseFloat(sc.askingPrice).toFixed(2)}
              </Text>
            ) : sc.card.marketPrice != null ? (
              <Text className="mt-0.5 text-sm text-muted-foreground">
                Mkt: ${sc.card.marketPrice.toFixed(2)}
              </Text>
            ) : null}
          </View>
        </View>
      ))}

      {/* Cash amount */}
      {cash > 0 && (
        <View className="flex-row items-center justify-between rounded-xl border border-border bg-card p-3">
          <Text className="text-sm text-muted-foreground">{CASH_LABELS[type]}</Text>
          <Text className="text-base font-semibold text-foreground">${cash.toFixed(2)}</Text>
        </View>
      )}

      {/* Total value */}
      <View className="flex-row items-center justify-between rounded-xl border border-primary/30 bg-primary/5 p-3">
        <Text className="text-sm font-medium text-foreground">Total Value</Text>
        <Text className="text-lg font-bold text-foreground">${totalValue.toFixed(2)}</Text>
      </View>

      {/* Description */}
      {description ? (
        <View>
          <Text className="mb-1 text-sm font-medium text-muted-foreground">Notes</Text>
          <Text className="text-sm text-foreground">{description}</Text>
        </View>
      ) : null}
    </View>
  );
};

export default BundleConfirmStep;
