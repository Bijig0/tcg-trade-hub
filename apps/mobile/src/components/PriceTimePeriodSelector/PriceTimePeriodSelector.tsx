import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { cn } from '@/lib/cn';

type PriceTimePeriodSelectorProps = {
  periods: string[];
  selected: string;
  onSelect: (period: string) => void;
};

/**
 * Pill-style selector for chart time periods (1M, 3M, 6M, 12M, MAX).
 */
const PriceTimePeriodSelector = ({
  periods,
  selected,
  onSelect,
}: PriceTimePeriodSelectorProps) => {
  return (
    <View className="flex-row gap-2">
      {periods.map((period) => {
        const isSelected = period === selected;
        return (
          <Pressable
            key={period}
            onPress={() => onSelect(period)}
            className={cn(
              'rounded-full px-3 py-1',
              isSelected
                ? 'bg-foreground'
                : 'bg-muted',
            )}
          >
            <Text
              className={cn(
                'text-xs font-semibold',
                isSelected
                  ? 'text-background'
                  : 'text-muted-foreground',
              )}
            >
              {period}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

export default PriceTimePeriodSelector;
