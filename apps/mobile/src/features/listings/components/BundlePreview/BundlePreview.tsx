import React, { useState, useCallback } from 'react';
import { View, Text, Image } from 'react-native';
import { ImageOff } from 'lucide-react-native';
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

type CardThumbnailProps = {
  item: ListingItemRow;
  sizeClass: string;
};

const CardThumbnail = ({ item, sizeClass }: CardThumbnailProps) => {
  const [hasError, setHasError] = useState(false);
  const handleError = useCallback(() => setHasError(true), []);

  const hasValidUri = item.card_image_url && item.card_image_url.length > 0;
  const showImage = hasValidUri && !hasError;

  return (
    <View className={cn(sizeClass, 'overflow-hidden rounded-md bg-muted')}>
      {showImage ? (
        <Image
          source={{ uri: item.card_image_url }}
          className="h-full w-full"
          resizeMode="cover"
          onError={handleError}
        />
      ) : (
        <View className="h-full w-full items-center justify-center">
          <ImageOff size={14} className="text-muted-foreground" />
        </View>
      )}
    </View>
  );
};

/**
 * Reusable card thumbnail grid showing up to 4 card images.
 * Displays a "+N more" badge when there are more than 4 items.
 * Each thumbnail reserves block spacing even when the image fails to load.
 */
const BundlePreview = ({ items, size = 'md', className }: BundlePreviewProps) => {
  const sizeConfig = SIZE_CLASSES[size];
  const safeItems = items ?? [];
  const displayItems = safeItems.slice(0, 4);
  const remaining = safeItems.length - 4;

  return (
    <View className={cn('flex-row items-center', sizeConfig.gap, className)}>
      {displayItems.map((item, index) => (
        <CardThumbnail
          key={item.id ?? `item-${index}`}
          item={item}
          sizeClass={sizeConfig.image}
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
