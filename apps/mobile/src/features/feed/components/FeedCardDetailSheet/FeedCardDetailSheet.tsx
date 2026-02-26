import React, { forwardRef, useCallback, useState, useMemo, useEffect } from 'react';
import { View, Text } from 'react-native';
import { Image } from 'expo-image';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import Badge from '@/components/ui/Badge/Badge';
import Button from '@/components/ui/Button/Button';
import SegmentedFilter from '@/components/ui/SegmentedFilter/SegmentedFilter';
import CollectionPriceChart from '@/features/collection/components/PriceChart/PriceChart';
import useCardDetail from '@/features/collection/hooks/useCardDetail/useCardDetail';
import { CONDITION_LABELS, TCG_LABELS } from '@/config/constants';
import BundleItemRow from '../BundleItemRow/BundleItemRow';
import type { CardDetailSheetItem } from '@/features/listings/components/CardDetailSheet/CardDetailSheet';
import type { ListingItemRow } from '@tcg-trade-hub/database';
import type { PriceVariant } from '@/services/cardData';

type FeedCardDetailSheetProps = {
  /** Currently selected item to show detail for */
  item: CardDetailSheetItem | null;
  /** All items in the listing (for bundle tab) */
  allItems: ListingItemRow[];
  onClose: () => void;
};

type TabValue = 'detail' | 'bundle';

const SNAP_POINTS = ['85%', '95%'];

const TAB_ITEMS: { value: TabValue; label: string }[] = [
  { value: 'detail', label: 'Detail' },
  { value: 'bundle', label: 'Bundle' },
];

/**
 * Feed-specific card detail bottom sheet with Detail and Bundle tabs.
 *
 * Detail tab: shows card image, pricing summary with variant selector,
 * price chart with time ranges, variant grid, and card metadata.
 *
 * Bundle tab: shows all items in the listing with market prices and
 * mini sparkline charts. Tapping an item switches to its detail view.
 */
const FeedCardDetailSheet = forwardRef<BottomSheet, FeedCardDetailSheetProps>(
  ({ item, allItems, onClose }, ref) => {
    const isBundle = allItems.length > 1;

    const [activeTab, setActiveTab] = useState<TabValue>('detail');
    const [internalItem, setInternalItem] = useState<CardDetailSheetItem | null>(null);

    // Reset internal state when parent item changes (new item opened)
    useEffect(() => {
      setInternalItem(null);
      setActiveTab('detail');
    }, [item?.card_external_id]);

    const displayItem = internalItem ?? item;

    const handleClose = useCallback(() => {
      onClose();
    }, [onClose]);

    const handleBundleItemPress = useCallback((bundleItem: ListingItemRow) => {
      setInternalItem({
        card_name: bundleItem.card_name,
        card_image_url: bundleItem.card_image_url,
        card_external_id: bundleItem.card_external_id,
        tcg: bundleItem.tcg,
        card_set: bundleItem.card_set,
        card_number: bundleItem.card_number,
        condition: bundleItem.condition,
        market_price: bundleItem.market_price,
        card_rarity: bundleItem.card_rarity,
      });
      setActiveTab('detail');
    }, []);

    // Price data for the displayed item
    const { data: cardDetail } = useCardDetail(displayItem?.card_external_id ?? null);

    const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
    const variantNames = useMemo(
      () => (cardDetail?.prices ? Object.keys(cardDetail.prices.variants) : []),
      [cardDetail],
    );
    const activeVariant = selectedVariant ?? variantNames[0] ?? null;

    const currentMarketPrice = useMemo(() => {
      if (cardDetail?.prices && activeVariant) {
        return cardDetail.prices.variants[activeVariant]?.market ?? displayItem?.market_price ?? null;
      }
      return displayItem?.market_price ?? null;
    }, [cardDetail, activeVariant, displayItem]);

    // Reset variant selection when displayed item changes
    useEffect(() => {
      setSelectedVariant(null);
    }, [displayItem?.card_external_id]);

    // Bundle total market value
    const totalMarketValue = useMemo(
      () => allItems.reduce((sum, i) => sum + (i.market_price ?? 0), 0),
      [allItems],
    );

    if (!displayItem) return null;

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
          {/* Tab selector (only for bundles) */}
          {isBundle && (
            <SegmentedFilter
              items={TAB_ITEMS}
              value={activeTab}
              onValueChange={setActiveTab}
              className="mx-4 mb-3"
            />
          )}

          {activeTab === 'detail' ? (
            <DetailTabContent
              item={displayItem}
              cardDetail={cardDetail}
              currentMarketPrice={currentMarketPrice}
              variantNames={variantNames}
              selectedVariant={selectedVariant}
              onSelectVariant={setSelectedVariant}
            />
          ) : (
            <BundleTabContent
              allItems={allItems}
              totalMarketValue={totalMarketValue}
              onItemPress={handleBundleItemPress}
            />
          )}
        </BottomSheetScrollView>
      </BottomSheet>
    );
  },
);

FeedCardDetailSheet.displayName = 'FeedCardDetailSheet';

// --- Detail Tab ---

type DetailTabContentProps = {
  item: CardDetailSheetItem;
  cardDetail: ReturnType<typeof useCardDetail>['data'];
  currentMarketPrice: number | null;
  variantNames: string[];
  selectedVariant: string | null;
  onSelectVariant: (v: string) => void;
};

const DetailTabContent = ({
  item,
  cardDetail,
  currentMarketPrice,
  variantNames,
  selectedVariant,
  onSelectVariant,
}: DetailTabContentProps) => (
  <>
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
      <Badge variant="outline">{TCG_LABELS[item.tcg as keyof typeof TCG_LABELS]}</Badge>
      <Badge variant="secondary">{CONDITION_LABELS[item.condition as keyof typeof CONDITION_LABELS]}</Badge>
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
                variant={(selectedVariant ?? variantNames[0]) === v ? 'default' : 'outline'}
                size="sm"
                onPress={() => onSelectVariant(v)}
              >
                <Text
                  className={`text-xs capitalize ${
                    (selectedVariant ?? variantNames[0]) === v ? 'text-primary-foreground' : 'text-foreground'
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
        <CollectionPriceChart priceHistory={cardDetail.priceHistory} />
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
  </>
);

// --- Bundle Tab ---

type BundleTabContentProps = {
  allItems: ListingItemRow[];
  totalMarketValue: number;
  onItemPress: (item: ListingItemRow) => void;
};

const BundleTabContent = ({
  allItems,
  totalMarketValue,
  onItemPress,
}: BundleTabContentProps) => (
  <View className="px-4">
    {/* Bundle header */}
    <View className="mb-4 rounded-xl bg-card p-4">
      <Text className="text-sm font-semibold text-foreground">
        Bundle Overview ({allItems.length} cards)
      </Text>
      <Text className="mt-1 text-2xl font-bold text-foreground">
        ${totalMarketValue.toFixed(2)}
      </Text>
      <Text className="text-xs text-muted-foreground">Total Market Value</Text>
    </View>

    {/* Item rows */}
    <View className="gap-2">
      {allItems.map((bundleItem) => (
        <BundleItemRow
          key={bundleItem.id}
          item={bundleItem}
          onPress={() => onItemPress(bundleItem)}
        />
      ))}
    </View>
  </View>
);

export default FeedCardDetailSheet;
