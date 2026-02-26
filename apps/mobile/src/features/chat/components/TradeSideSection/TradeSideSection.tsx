import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Pencil } from 'lucide-react-native';
import Card, { CardContent } from '@/components/ui/Card/Card';
import TradeItemRow from '../TradeItemRow/TradeItemRow';
import type { TradeContextItem } from '../../hooks/useTradeContext/useTradeContext';

export type TradeSideSectionProps = {
  label: string;
  items: TradeContextItem[];
  totalValue: number;
  isEditable?: boolean;
  onPress?: () => void;
};

/** Card container showing one side of a trade — section label, item list, total value */
const TradeSideSection = ({ label, items, totalValue, isEditable, onPress }: TradeSideSectionProps) => {
  const content = (
    <Card>
      <View className="flex-row items-center justify-between border-b border-border px-4 py-2.5">
        <Text className="text-xs font-semibold uppercase text-muted-foreground">
          {label}
        </Text>
        {isEditable && (
          <View className="flex-row items-center gap-1">
            <Text className="text-[10px] text-muted-foreground">Tap to edit</Text>
            <Pencil size={12} color="#9ca3af" />
          </View>
        )}
      </View>
      <CardContent className="px-4 py-2">
        {items.length === 0 ? (
          <Text className="py-2 text-sm italic text-muted-foreground">
            No cards
          </Text>
        ) : (
          items.map((item, i) => <TradeItemRow key={i} item={item} />)
        )}
      </CardContent>
      <View className="border-t border-border px-4 py-2.5">
        <Text className="text-right text-sm font-semibold text-foreground">
          Total: ${totalValue.toFixed(2)}
        </Text>
      </View>
    </Card>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} className="active:opacity-80">
        {content}
      </Pressable>
    );
  }

  return content;
};

export default TradeSideSection;
