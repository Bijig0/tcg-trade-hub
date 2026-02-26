import React from 'react';
import { View, Text, Image } from 'react-native';
import Badge from '@/components/ui/Badge/Badge';
import { CONDITION_LABELS } from '@/config/constants';
import type { TradeContextItem } from '../../hooks/useTradeContext/useTradeContext';

export type TradeItemRowProps = {
  item: TradeContextItem;
};

/** Single card row in the offer detail — thumbnail, name, condition badge, quantity, market price */
const TradeItemRow = ({ item }: TradeItemRowProps) => {
  const conditionLabel = CONDITION_LABELS[item.condition as keyof typeof CONDITION_LABELS];

  return (
    <View className="flex-row items-center gap-3 py-1.5">
      <Image
        source={{ uri: item.cardImageUrl }}
        className="h-14 w-10 rounded"
        resizeMode="cover"
      />
      <View className="flex-1 gap-0.5">
        <View className="flex-row items-center gap-1.5">
          <Text className="flex-shrink text-sm font-medium text-foreground" numberOfLines={1}>
            {item.cardName}
          </Text>
          {item.quantity > 1 && (
            <View className="rounded-full bg-accent px-1.5 py-0.5">
              <Text className="text-[10px] font-semibold text-muted-foreground">
                x{item.quantity}
              </Text>
            </View>
          )}
        </View>
        {conditionLabel && (
          <Badge variant="secondary" className="self-start">{conditionLabel}</Badge>
        )}
      </View>
      {item.marketPrice != null && (
        <Text className="text-sm font-medium text-foreground">
          ${item.marketPrice.toFixed(2)}
        </Text>
      )}
    </View>
  );
};

export default TradeItemRow;
