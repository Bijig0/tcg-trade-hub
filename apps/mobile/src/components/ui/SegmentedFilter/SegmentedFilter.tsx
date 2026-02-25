import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { cn } from '@/lib/cn';

export type SegmentedFilterItem<T extends string> = {
  value: T;
  label: string;
  count?: number;
  testID?: string;
};

export type SegmentedFilterProps<T extends string> = {
  items: SegmentedFilterItem<T>[];
  value: T;
  onValueChange: (value: T) => void;
  className?: string;
};

/**
 * A horizontal segmented tab bar with underline-style active indicator and optional counts.
 *
 * Generic over `T extends string` for type-safe tab values.
 *
 * @example
 * ```tsx
 * <SegmentedFilter
 *   items={[
 *     { value: 'active', label: 'Active', count: 5 },
 *     { value: 'matched', label: 'Matched', count: 2 },
 *     { value: 'history', label: 'History', count: 10 },
 *   ]}
 *   value={activeTab}
 *   onValueChange={setActiveTab}
 * />
 * ```
 */
const SegmentedFilter = <T extends string>({
  items,
  value,
  onValueChange,
  className,
}: SegmentedFilterProps<T>) => {
  return (
    <View className={cn('flex-row border-b border-border', className)}>
      {items.map((item) => {
        const isActive = item.value === value;
        return (
          <Pressable
            key={item.value}
            testID={item.testID}
            onPress={() => onValueChange(item.value)}
            className={cn(
              'flex-1 items-center pb-2.5 pt-3',
              isActive ? 'border-b-2 border-primary' : 'border-b-2 border-transparent',
            )}
          >
            <Text
              className={cn(
                'text-sm font-medium',
                isActive ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              {item.label}
              {item.count != null ? ` (${item.count})` : ''}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

export default SegmentedFilter;
