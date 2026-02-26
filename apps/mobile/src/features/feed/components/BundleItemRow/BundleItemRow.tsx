import React, { useState, useCallback } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { ImageOff } from 'lucide-react-native';
import Badge from '@/components/ui/Badge/Badge';
import PriceChart from '@/components/PriceChart/PriceChart';
import useCardDetail from '@/features/collection/hooks/useCardDetail/useCardDetail';
import { CONDITION_LABELS } from '@/config/constants';
import type { ListingItemRow } from '@tcg-trade-hub/database';

type BundleItemRowProps = {
  item: ListingItemRow;
  onPress: () => void;
};

/**
 * Compact card row used in the Bundle tab of FeedCardDetailSheet.
 *
 * Shows thumbnail, card info, condition badge, market price,
 * and a mini sparkline price chart. Tappable to switch to
 * detail view for this item.
 */
const BundleItemRow = ({ item, onPress }: BundleItemRowProps) => {
  const [imageError, setImageError] = useState(false);
  const handleImageError = useCallback(() => setImageError(true), []);
  const { data: cardDetail } = useCardDetail(item.card_external_id ?? null);

  const hasValidUri = item.card_image_url && item.card_image_url.length > 0;
  const showImage = hasValidUri && !imageError;

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 rounded-xl bg-card p-3 active:bg-accent"
    >
      {/* Thumbnail */}
      <View className="h-14 w-10 overflow-hidden rounded-lg bg-muted">
        {showImage ? (
          <Image
            source={{ uri: item.card_image_url }}
            className="h-full w-full"
            contentFit="cover"
            cachePolicy="disk"
            recyclingKey={item.card_external_id ?? item.card_image_url}
            transition={150}
            onError={handleImageError}
          />
        ) : (
          <View className="h-full w-full items-center justify-center">
            <ImageOff size={14} className="text-muted-foreground" />
          </View>
        )}
      </View>

      {/* Card info */}
      <View className="flex-1 gap-0.5">
        <Text className="text-sm font-medium text-foreground" numberOfLines={1}>
          {item.card_name}
        </Text>
        <Text className="text-xs text-muted-foreground" numberOfLines={1}>
          {item.card_set ?? ''}{item.card_number ? ` #${item.card_number}` : ''}
        </Text>
        <View className="mt-0.5 flex-row items-center gap-1.5">
          <Badge variant="secondary" className="px-1.5 py-0">
            {CONDITION_LABELS[item.condition as keyof typeof CONDITION_LABELS]}
          </Badge>
          {item.market_price != null && (
            <Text className="text-xs font-semibold text-foreground">
              ${item.market_price.toFixed(2)}
            </Text>
          )}
        </View>
      </View>

      {/* Mini sparkline */}
      {cardDetail?.priceHistory && (
        <View className="w-20">
          <PriceChart priceHistory={cardDetail.priceHistory} height={40} />
        </View>
      )}
    </Pressable>
  );
};

export default BundleItemRow;
