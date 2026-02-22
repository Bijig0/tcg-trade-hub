import React from 'react';
import { View, Text, Image } from 'react-native';
import { cn } from '@/lib/cn';
import type { ListingItemRow } from '@tcg-trade-hub/database';

type BundlePreviewProps = {
  items: ListingItemRow[];
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const SIZE_CLASSES = {
  sm: { image: 'h-10 w-7', gap: 'gap-1', badge: 'text-xs' },
  md: { image: 'h-16 w-11', gap: 'gap-1.5', badge: 'text-xs' },
  lg: { image: 'h-20 w-14', gap: 'gap-2', badge: 'text-sm' },
} as const;

/**
 * Reusable card thumbnail grid showing up to 4 card images.
 * Displays a "+N more" badge when there are more than 4 items.
 */
const BundlePreview = ({ items, size = 'md', className }: BundlePreviewProps) => {
  const sizeConfig = SIZE_CLASSES[size];
  const displayItems = items.slice(0, 4);
  const remaining = items.length - 4;

  return (
    <View className={cn('flex-row items-center', sizeConfig.gap, className)}>
      {displayItems.map((item, index) => (
        <Image
          key={item.id ?? `item-${index}`}
          source={{ uri: item.card_image_url }}
          className={cn(sizeConfig.image, 'rounded-md bg-muted')}
          resizeMode="cover"
        />
      ))}
      {remaining > 0 && (
        <View className="items-center justify-center rounded-md bg-muted px-1.5 py-1">
          <Text className={cn('font-medium text-muted-foreground', sizeConfig.badge)}>
            +{remaining}
          </Text>
        </View>
      )}
    </View>
  );
};

export default BundlePreview;
