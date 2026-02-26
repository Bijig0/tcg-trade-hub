import React, { useState, useCallback } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { ImageOff } from 'lucide-react-native';
import { cn } from '@/lib/cn';
import type { ListingItemRow } from '@tcg-trade-hub/database';

type BundleItemSelectorProps = {
  items: ListingItemRow[];
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
};

type SelectableThumbnailProps = {
  item: ListingItemRow;
  isSelected: boolean;
  onPress: () => void;
};

const SelectableThumbnail = ({ item, isSelected, onPress }: SelectableThumbnailProps) => {
  const [hasError, setHasError] = useState(false);
  const handleError = useCallback(() => setHasError(true), []);

  const hasValidUri = item.card_image_url && item.card_image_url.length > 0;
  const showImage = hasValidUri && !hasError;

  return (
    <Pressable onPress={onPress}>
      <View
        className={cn(
          'h-10 w-7 overflow-hidden rounded-md',
          isSelected ? 'border-2 border-primary' : 'border border-border',
        )}
      >
        {showImage ? (
          <Image
            source={{ uri: item.card_image_url }}
            className="h-full w-full"
            contentFit="cover"
            cachePolicy="disk"
            recyclingKey={item.card_external_id ?? item.card_image_url}
            transition={150}
            onError={handleError}
          />
        ) : (
          <View className="h-full w-full items-center justify-center bg-muted">
            <ImageOff size={10} className="text-muted-foreground" />
          </View>
        )}
      </View>
    </Pressable>
  );
};

/**
 * Interactive bundle thumbnail selector for SwipeCard.
 *
 * Renders a horizontal scrollable row of card thumbnails. The selected
 * thumbnail gets a primary border highlight. Only shown when a listing
 * has multiple items.
 */
const BundleItemSelector = ({
  items,
  selectedIndex,
  onSelectIndex,
}: BundleItemSelectorProps) => {
  const safeItems = items ?? [];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="flex-row items-center gap-1"
    >
      {safeItems.map((item, index) => (
        <SelectableThumbnail
          key={item.id ?? `item-${index}`}
          item={item}
          isSelected={index === selectedIndex}
          onPress={() => onSelectIndex(index)}
        />
      ))}
    </ScrollView>
  );
};

export default BundleItemSelector;
