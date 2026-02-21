import React from 'react';
import { View, Text } from 'react-native';
import { cn } from '@/lib/cn';
import type { ListingType } from '@tcg-trade-hub/database';

const TYPE_STYLES = {
  wts: { bg: 'bg-emerald-600', label: 'WTS', longLabel: 'Want to Sell' },
  wtb: { bg: 'bg-blue-600', label: 'WTB', longLabel: 'Want to Buy' },
  wtt: { bg: 'bg-amber-600', label: 'WTT', longLabel: 'Want to Trade' },
} as const;

type ListingTypeBadgeProps = {
  type: ListingType;
  /** Show the full label ("Want to Sell") instead of the abbreviation ("WTS") */
  long?: boolean;
  className?: string;
};

/**
 * Semantic color-coded badge for listing types.
 *
 * - WTS → green (money/selling)
 * - WTB → blue (seeking/requesting)
 * - WTT → amber (exchange/swap)
 */
const ListingTypeBadge = ({ type, long = false, className }: ListingTypeBadgeProps) => {
  const style = TYPE_STYLES[type];

  return (
    <View className={cn('self-start rounded-full px-2.5 py-0.5', style.bg, className)}>
      <Text className="text-xs font-semibold text-white">
        {long ? style.longLabel : style.label}
      </Text>
    </View>
  );
};

export default ListingTypeBadge;
