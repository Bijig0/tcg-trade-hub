import React from 'react';
import { View, Text } from 'react-native';
import Card, { CardContent } from '@/components/ui/Card/Card';
import TradeItemRow from '../TradeItemRow/TradeItemRow';
import type { TradeContextItem } from '../../hooks/useTradeContext/useTradeContext';

export type TradeSideSectionProps = {
  label: string;
  items: TradeContextItem[];
  totalValue: number;
};

/** Card container showing one side of a trade — section label, item list, total value */
const TradeSideSection = ({ label, items, totalValue }: TradeSideSectionProps) => {
  return (
    <Card>
      <View className="border-b border-border px-4 py-2.5">
        <Text className="text-xs font-semibold uppercase text-muted-foreground">
          {label}
        </Text>
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
};

export default TradeSideSection;
