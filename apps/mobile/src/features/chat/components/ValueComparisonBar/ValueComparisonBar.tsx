import React from 'react';
import { View, Text } from 'react-native';

export type ValueComparisonBarProps = {
  myValue: number;
  theirValue: number;
};

/**
 * Horizontal bar showing proportional value split between two trade sides.
 * Displays a warning when values differ by more than 20%.
 */
const ValueComparisonBar = ({ myValue, theirValue }: ValueComparisonBarProps) => {
  const total = myValue + theirValue;

  if (total === 0) return null;

  const myPercent = Math.round((myValue / total) * 100);
  const theirPercent = 100 - myPercent;
  const diff = total > 0 ? Math.abs(myValue - theirValue) / Math.max(myValue, theirValue) : 0;
  const isUnbalanced = diff > 0.2;

  return (
    <View className="gap-1.5 px-1">
      <View className="h-3 flex-row overflow-hidden rounded-full">
        <View
          className="rounded-l-full bg-primary"
          style={{ flex: myValue || 0.01 }}
        />
        <View
          className="rounded-r-full bg-secondary"
          style={{ flex: theirValue || 0.01 }}
        />
      </View>
      <View className="flex-row justify-between">
        <Text className="text-xs text-muted-foreground">
          ${myValue.toFixed(2)} ({myPercent}%)
        </Text>
        <Text className="text-xs text-muted-foreground">
          ${theirValue.toFixed(2)} ({theirPercent}%)
        </Text>
      </View>
      {isUnbalanced && (
        <Text className="text-center text-xs text-yellow-600">
          Values differ by more than 20%
        </Text>
      )}
    </View>
  );
};

export default ValueComparisonBar;
