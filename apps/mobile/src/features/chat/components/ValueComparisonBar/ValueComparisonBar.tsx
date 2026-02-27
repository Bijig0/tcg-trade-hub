import React from 'react';
import { View, Text } from 'react-native';

export type ValueComparisonBarProps = {
  myValue: number;
  theirValue: number;
};

/**
 * Horizontal bar showing proportional value split between two trade sides.
 * Color-coded: blue (my side) vs amber (their side).
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
    <View className="gap-2 rounded-xl bg-muted/50 px-4 py-3">
      {/* Labels */}
      <View className="flex-row justify-between">
        <View className="flex-row items-center gap-1.5">
          <View className="h-2.5 w-2.5 rounded-full bg-primary" />
          <Text className="text-xs font-semibold text-foreground">
            ${myValue.toFixed(2)}
          </Text>
          <Text className="text-xs text-muted-foreground">
            ({myPercent}%)
          </Text>
        </View>
        <View className="flex-row items-center gap-1.5">
          <Text className="text-xs text-muted-foreground">
            ({theirPercent}%)
          </Text>
          <Text className="text-xs font-semibold text-foreground">
            ${theirValue.toFixed(2)}
          </Text>
          <View className="h-2.5 w-2.5 rounded-full bg-amber-500" />
        </View>
      </View>
      {/* Bar */}
      <View className="h-4 flex-row overflow-hidden rounded-full">
        <View
          className="rounded-l-full bg-primary"
          style={{ flex: myValue || 0.01 }}
        />
        <View className="w-0.5 bg-background" />
        <View
          className="rounded-r-full bg-amber-500"
          style={{ flex: theirValue || 0.01 }}
        />
      </View>
      {isUnbalanced && (
        <Text className="text-center text-xs font-medium text-yellow-600">
          Values differ by more than 20%
        </Text>
      )}
    </View>
  );
};

export default ValueComparisonBar;
