import React from 'react';
import { View, Text, Image } from 'react-native';
import Badge from '@/components/ui/Badge/Badge';
import type { SelectedCard } from '../../schemas';

type WtsConfirmStepProps = {
  selectedCards: SelectedCard[];
};

/**
 * Step 4 for WTS — review before publishing.
 *
 * Shows all selected cards with their thumbnails, conditions, and prices.
 * Displays total value and card count.
 */
const WtsConfirmStep = ({ selectedCards }: WtsConfirmStepProps) => {
  const totalValue = selectedCards.reduce((sum, sc) => {
    const price = parseFloat(sc.askingPrice);
    return sum + (isNaN(price) ? 0 : price);
  }, 0);

  return (
    <View className="gap-4">
      <View>
        <Text className="text-base font-medium text-foreground">
          Review your listings
        </Text>
        <Text className="mt-1 text-sm text-muted-foreground">
          {selectedCards.length} card{selectedCards.length !== 1 ? 's' : ''} &middot; Total: ${totalValue.toFixed(2)}
        </Text>
      </View>

      {selectedCards.map((sc) => (
        <View
          key={sc.card.externalId}
          className="flex-row items-center gap-3 rounded-xl border border-border bg-card p-3"
        >
          <Image
            source={{ uri: sc.card.imageUrl }}
            className="h-20 w-14 rounded-lg bg-muted"
            resizeMode="cover"
          />
          <View className="flex-1 gap-1">
            <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
              {sc.card.name}
            </Text>
            <Text className="text-xs text-muted-foreground" numberOfLines={1}>
              {sc.card.setName}
            </Text>
            <View className="flex-row items-center gap-2">
              <Badge variant="default">WTS</Badge>
              <Badge variant="outline">{sc.condition.toUpperCase()}</Badge>
            </View>
            {sc.askingPrice && (
              <Text className="mt-0.5 text-base font-semibold text-foreground">
                ${parseFloat(sc.askingPrice).toFixed(2)}
              </Text>
            )}
          </View>
        </View>
      ))}
    </View>
  );
};

export default WtsConfirmStep;
