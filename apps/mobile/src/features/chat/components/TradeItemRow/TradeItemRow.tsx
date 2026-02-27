import React from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import { X } from 'lucide-react-native';
import Badge from '@/components/ui/Badge/Badge';
import { CONDITION_LABELS } from '@/config/constants';
import type { TradeContextItem } from '../../hooks/useTradeContext/useTradeContext';

export type TradeItemRowProps = {
  item: TradeContextItem;
  onRemove?: () => void;
  onCardPress?: (item: TradeContextItem) => void;
};

/** Single card row — thumbnail, name, condition badge, quantity, market price, optional remove */
const TradeItemRow = ({ item, onRemove, onCardPress }: TradeItemRowProps) => {
  const conditionLabel = CONDITION_LABELS[item.condition as keyof typeof CONDITION_LABELS];

  const row = (
    <View className="flex-row items-center gap-3 border-b border-border/50 py-2 last:border-b-0">
      <Image
        source={{ uri: item.cardImageUrl }}
        className="h-16 w-12 rounded-lg"
        resizeMode="cover"
      />
      <View className="flex-1 gap-0.5">
        <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
          {item.cardName}
        </Text>
        <View className="flex-row items-center gap-1.5">
          {conditionLabel && (
            <Badge variant="secondary" className="self-start">{conditionLabel}</Badge>
          )}
          {item.quantity > 1 && (
            <View className="rounded-full bg-accent px-1.5 py-0.5">
              <Text className="text-[10px] font-semibold text-muted-foreground">
                x{item.quantity}
              </Text>
            </View>
          )}
        </View>
      </View>
      {item.marketPrice != null && (
        <Text className="text-sm font-bold text-foreground">
          ${item.marketPrice.toFixed(2)}
        </Text>
      )}
      {onRemove && (
        <Pressable
          onPress={onRemove}
          className="ml-1 rounded-full bg-destructive/10 p-1.5 active:opacity-70"
          hitSlop={6}
        >
          <X size={12} color="#ef4444" />
        </Pressable>
      )}
    </View>
  );

  if (onCardPress) {
    return (
      <Pressable onPress={() => onCardPress(item)} className="active:opacity-70">
        {row}
      </Pressable>
    );
  }

  return row;
};

export default TradeItemRow;
