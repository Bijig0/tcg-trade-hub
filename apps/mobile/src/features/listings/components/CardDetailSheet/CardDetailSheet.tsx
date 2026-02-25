import React, { forwardRef, useCallback, useState, useMemo } from 'react';
import { View, Text } from 'react-native';
import { Image } from 'expo-image';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import Badge from '@/components/ui/Badge/Badge';
import Button from '@/components/ui/Button/Button';
import PriceChart from '@/features/collection/components/PriceChart/PriceChart';
import useCardDetail from '@/features/collection/hooks/useCardDetail/useCardDetail';
import { CONDITION_LABELS, TCG_LABELS } from '@/config/constants';
import type { TcgType, CardCondition } from '@tcg-trade-hub/database';
import type { PriceVariant } from '@/services/cardData';

export type CardDetailSheetItem = {
  card_name: string;
  card_image_url: string;
  card_external_id: string;
  tcg: TcgType;
  card_set: string | null;
  card_number: string | null;
  condition: CardCondition;
  market_price: number | null;
  card_rarity?: string | null;
};

type CardDetailSheetProps = {
  item: CardDetailSheetItem | null;
  onClose: () => void;
};

const SNAP_POINTS = ['85%', '95%'];

/**
 * Stacked bottom sheet showing read-only card detail.
 * Shows card image, header, price summary, price chart, variants grid, and metadata.
 */
const CardDetailSheet = forwardRef<BottomSheet, CardDetailSheetProps>(
  ({ item, onClose }, ref) => {
    const handleClose = useCallback(() => {
      onClose();
    }, [onClose]);

    const { data: cardDetail } = useCardDetail(item?.card_external_id ?? null);

    const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
    const variantNames = useMemo(
      () => (cardDetail?.prices ? Object.keys(cardDetail.prices.variants) : []),
      [cardDetail],
    );
    const activeVariant = selectedVariant ?? variantNames[0] ?? null;

    const currentMarketPrice = useMemo(() => {
      if (cardDetail?.prices && activeVariant) {
        return cardDetail.prices.variants[activeVariant]?.market ?? item?.market_price ?? null;
      }
      return item?.market_price ?? null;
    }, [cardDetail, activeVariant, item]);

    if (!item) return null;

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={SNAP_POINTS}
        enablePanDownToClose
        onClose={handleClose}
        backgroundStyle={{ borderRadius: 20, backgroundColor: '#0f0f13' }}
        handleIndicatorStyle={{ backgroundColor: '#a1a1aa', width: 40 }}
      >
        <BottomSheetScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Card image */}
          <View className="items-center px-4 pt-2">
            <Image
              source={{ uri: item.card_image_url }}
              className="h-64 w-44 rounded-xl bg-muted"
              contentFit="contain"
              cachePolicy="disk"
              transition={200}
            />
          </View>

          {/* Card header */}
          <Text className="mt-3 text-center text-xl font-bold text-foreground">
            {item.card_name}
          </Text>
          <Text className="mb-1 text-center text-sm text-muted-foreground">
            {item.card_set ?? ''}{item.card_number ? ` #${item.card_number}` : ''}
          </Text>

          {/* Badges */}
          <View className="mb-4 flex-row flex-wrap justify-center gap-2 px-4">
            {item.card_rarity ? <Badge variant="secondary">{item.card_rarity}</Badge> : null}
            <Badge variant="outline">{TCG_LABELS[item.tcg]}</Badge>
            <Badge variant="secondary">{CONDITION_LABELS[item.condition]}</Badge>
          </View>

          {/* Price summary card */}
          {currentMarketPrice != null ? (
            <View className="mx-4 mb-4 rounded-xl bg-card p-4">
              <Text className="text-2xl font-bold text-foreground">
                ${currentMarketPrice.toFixed(2)}
              </Text>
              {cardDetail?.priceHistory ? (
                <View className="flex-row items-center gap-1">
                  <Text
                    className={`text-sm font-medium ${
                      cardDetail.priceHistory.changePercent >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}
                  >
                    {cardDetail.priceHistory.changePercent >= 0 ? '\u25B2' : '\u25BC'}
                    {` ${cardDetail.priceHistory.changePercent >= 0 ? '+' : ''}${cardDetail.priceHistory.changePercent.toFixed(1)}%`}
                  </Text>
                </View>
              ) : null}

              {/* Variant selector tabs */}
              {variantNames.length > 1 ? (
                <View className="mt-3 flex-row flex-wrap gap-2">
                  {variantNames.map((v) => (
                    <Button
                      key={v}
                      variant={activeVariant === v ? 'default' : 'outline'}
                      size="sm"
                      onPress={() => setSelectedVariant(v)}
                    >
                      <Text
                        className={`text-xs capitalize ${
                          activeVariant === v ? 'text-primary-foreground' : 'text-foreground'
                        }`}
                      >
                        {v}
                      </Text>
                    </Button>
                  ))}
                </View>
              ) : null}
            </View>
          ) : null}

          {/* Price chart */}
          {cardDetail?.priceHistory ? (
            <View className="mx-4 mb-4">
              <PriceChart
                priceHistory={cardDetail.priceHistory}
                currentPrice={currentMarketPrice}
              />
            </View>
          ) : null}

          {/* Price variants grid */}
          {cardDetail?.prices ? (
            <View className="mx-4 mb-4 rounded-xl bg-card p-4">
              <Text className="mb-2 text-sm font-semibold text-foreground">Price Variants</Text>
              {Object.entries(cardDetail.prices.variants).map(([variant, prices]) => (
                <View key={variant} className="mb-2">
                  <Text className="text-xs font-medium capitalize text-muted-foreground">{variant}</Text>
                  <View className="flex-row gap-4">
                    {(['low', 'mid', 'high', 'market'] as const).map((key) => (
                      <View key={key}>
                        <Text className="text-xs text-muted-foreground">{key}</Text>
                        <Text className="text-sm font-medium text-foreground">
                          {(prices as PriceVariant)[key] != null
                            ? `$${(prices as PriceVariant)[key]!.toFixed(2)}`
                            : '-'}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
              {cardDetail.prices.trendPrice != null ? (
                <Text className="mt-1 text-xs text-muted-foreground">
                  Trend: ${cardDetail.prices.trendPrice.toFixed(2)}
                </Text>
              ) : null}
            </View>
          ) : null}

          {/* Card metadata */}
          {cardDetail ? (
            <View className="mx-4 mb-4 rounded-xl bg-card p-4">
              <Text className="mb-2 text-sm font-semibold text-foreground">Card Info</Text>
              <View className="gap-1">
                {cardDetail.artist ? (
                  <Text className="text-xs text-muted-foreground">Artist: {cardDetail.artist}</Text>
                ) : null}
                {cardDetail.hp ? (
                  <Text className="text-xs text-muted-foreground">HP: {cardDetail.hp}</Text>
                ) : null}
                {cardDetail.types.length > 0 ? (
                  <Text className="text-xs text-muted-foreground">
                    Types: {cardDetail.types.join(', ')}
                  </Text>
                ) : null}
                {cardDetail.rarity ? (
                  <Text className="text-xs text-muted-foreground">Rarity: {cardDetail.rarity}</Text>
                ) : null}
              </View>
            </View>
          ) : null}
        </BottomSheetScrollView>
      </BottomSheet>
    );
  },
);

CardDetailSheet.displayName = 'CardDetailSheet';

export default CardDetailSheet;
