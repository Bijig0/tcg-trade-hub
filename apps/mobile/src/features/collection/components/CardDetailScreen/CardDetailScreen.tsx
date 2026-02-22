import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import useMyCollection from '../../hooks/useMyCollection/useMyCollection';
import useMyWishlist from '../../hooks/useMyWishlist/useMyWishlist';
import useMySealedProducts from '../../hooks/useMySealedProducts/useMySealedProducts';
import useCardDetail from '../../hooks/useCardDetail/useCardDetail';
import useUpdateCollectionItem from '../../hooks/useUpdateCollectionItem/useUpdateCollectionItem';
import useRemoveCollectionItem from '../../hooks/useRemoveCollectionItem/useRemoveCollectionItem';
import PhotoGallery from '../PhotoGallery/PhotoGallery';
import PriceChart from '../PriceChart/PriceChart';
import Button from '@/components/ui/Button/Button';
import Badge from '@/components/ui/Badge/Badge';
import Select from '@/components/ui/Select/Select';
import Input from '@/components/ui/Input/Input';
import {
  CONDITION_LABELS,
  GRADING_COMPANY_LABELS,
  GRADING_SCORE_OPTIONS,
  TCG_LABELS,
} from '@/config/constants';
import type { CardCondition, GradingCompany } from '@tcg-trade-hub/database';
import type { PriceVariant } from '@/services/cardData';

const CONDITION_OPTIONS = Object.entries(CONDITION_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const GRADING_OPTIONS = Object.entries(GRADING_COMPANY_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const CardDetailScreen: React.FC = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: collection } = useMyCollection();
  const { data: wishlist } = useMyWishlist();
  const { data: sealed } = useMySealedProducts();
  const updateItem = useUpdateCollectionItem();
  const removeItem = useRemoveCollectionItem();

  const allItems = [...(collection ?? []), ...(wishlist ?? []), ...(sealed ?? [])];
  const item = allItems.find((i) => i.id === id) ?? null;

  const { data: cardDetail } = useCardDetail(item?.external_id ?? null);

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editCondition, setEditCondition] = useState<string>(item?.condition ?? 'nm');
  const [editGradingCompany, setEditGradingCompany] = useState<string>(item?.grading_company ?? '');
  const [editGradingScore, setEditGradingScore] = useState(item?.grading_score ?? '');
  const [editPurchasePrice, setEditPurchasePrice] = useState(
    item?.purchase_price != null ? String(item.purchase_price) : '',
  );
  const [editAcquiredAt, setEditAcquiredAt] = useState(
    item?.acquired_at ? item.acquired_at.slice(0, 10) : '',
  );

  // Notes state (auto-saves on blur)
  const [notes, setNotes] = useState(item?.notes ?? '');

  // Selected variant tab for price display
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const variantNames = cardDetail?.prices
    ? Object.keys(cardDetail.prices.variants)
    : [];
  const activeVariant = selectedVariant ?? variantNames[0] ?? null;

  const handleStartEdit = useCallback(() => {
    if (!item) return;
    setEditCondition(item.condition);
    setEditGradingCompany(item.grading_company ?? '');
    setEditGradingScore(item.grading_score ?? '');
    setEditPurchasePrice(item.purchase_price != null ? String(item.purchase_price) : '');
    setEditAcquiredAt(item.acquired_at ? item.acquired_at.slice(0, 10) : '');
    setIsEditing(true);
  }, [item]);

  const handleSave = useCallback(() => {
    if (!item) return;
    const pp = editPurchasePrice ? parseFloat(editPurchasePrice) : null;
    updateItem.mutate(
      {
        id: item.id,
        updates: {
          condition: editCondition as CardCondition,
          grading_company: (editGradingCompany || null) as GradingCompany | null,
          grading_score: editGradingScore || null,
          purchase_price: pp != null && !isNaN(pp) ? pp : null,
          acquired_at: editAcquiredAt || null,
        },
      },
      { onSuccess: () => setIsEditing(false) },
    );
  }, [item, editCondition, editGradingCompany, editGradingScore, editPurchasePrice, editAcquiredAt, updateItem]);

  const handleNotesBlur = useCallback(() => {
    if (!item || notes === (item.notes ?? '')) return;
    updateItem.mutate({ id: item.id, updates: { notes: notes || null } });
  }, [item, notes, updateItem]);

  const handleRemove = useCallback(() => {
    if (!item) return;
    Alert.alert('Remove', 'Remove this item from your collection?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          removeItem.mutate(item.id, { onSuccess: () => router.back() });
        },
      },
    ]);
  }, [item, removeItem, router]);

  const handleCreateListing = useCallback(() => {
    if (!item) return;
    router.push(
      `/(tabs)/(listings)/create-listing?cardId=${item.external_id}&cardName=${encodeURIComponent(item.card_name)}&cardImage=${encodeURIComponent(item.image_url)}&tcg=${item.tcg}&collectionItemId=${item.id}`,
    );
  }, [item, router]);

  if (!item) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-muted-foreground">Item not found</Text>
      </View>
    );
  }

  const gradingLabel = item.grading_company
    ? GRADING_COMPANY_LABELS[item.grading_company as GradingCompany]
    : null;

  const currentMarketPrice = cardDetail?.prices && activeVariant
    ? cardDetail.prices.variants[activeVariant]?.market ?? item.market_price
    : item.market_price;

  const gradingScoreOptions = editGradingCompany
    ? (GRADING_SCORE_OPTIONS[editGradingCompany as GradingCompany] ?? []).map((s) => ({
        value: s,
        label: s,
      }))
    : [];

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
    <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
      {/* 1. Back button */}
      <View className="mb-4 flex-row items-center">
        <Button variant="ghost" size="sm" onPress={() => router.back()}>
          <Text className="text-sm text-primary">Back</Text>
        </Button>
      </View>

      {/* 2. Photo Gallery */}
      <View className="mb-4">
        <PhotoGallery item={item} />
      </View>

      {/* 3. Card Header */}
      <Text className="text-center text-xl font-bold text-foreground">{item.card_name}</Text>
      <Text className="mb-1 text-center text-sm text-muted-foreground">
        {item.set_name} #{item.card_number}
      </Text>
      <View className="mb-4 flex-row flex-wrap justify-center gap-2">
        {item.rarity ? <Badge variant="secondary">{item.rarity}</Badge> : null}
        <Badge variant="outline">{TCG_LABELS[item.tcg]}</Badge>
        <Badge variant="secondary">{CONDITION_LABELS[item.condition]}</Badge>
        {gradingLabel && item.grading_score ? (
          <Badge>{`${gradingLabel} ${item.grading_score}`}</Badge>
        ) : null}
      </View>

      {/* 4. Price Summary Card */}
      {currentMarketPrice != null ? (
        <View className="mb-4 rounded-xl bg-card p-4">
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

      {/* 5. Price Chart */}
      {cardDetail?.priceHistory ? (
        <View className="mb-4">
          <PriceChart
            priceHistory={cardDetail.priceHistory}
            currentPrice={currentMarketPrice}
          />
        </View>
      ) : null}

      {/* 6. Price Variants Grid */}
      {cardDetail?.prices ? (
        <View className="mb-4 rounded-xl bg-card p-4">
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

      {/* 7. Your Card Details (editable) */}
      {isEditing ? (
        <View className="mb-4 rounded-xl bg-card p-4">
          <Text className="mb-3 text-sm font-semibold text-foreground">Edit Card Details</Text>

          <Select
            label="Condition"
            value={editCondition}
            onValueChange={setEditCondition}
            options={CONDITION_OPTIONS}
          />

          <View className="mt-3">
            <Select
              label="Grading Company"
              value={editGradingCompany}
              onValueChange={(v) => {
                setEditGradingCompany(v);
                setEditGradingScore('');
              }}
              options={[{ value: '', label: 'None' }, ...GRADING_OPTIONS]}
            />
          </View>

          {editGradingCompany && gradingScoreOptions.length > 0 ? (
            <View className="mt-3">
              <Select
                label="Grade"
                value={editGradingScore}
                onValueChange={setEditGradingScore}
                options={gradingScoreOptions}
              />
            </View>
          ) : null}

          <View className="mt-3">
            <Input
              label="Acquired Date (YYYY-MM-DD)"
              value={editAcquiredAt}
              onChangeText={setEditAcquiredAt}
              placeholder="2024-01-15"
            />
          </View>

          <View className="mt-3">
            <Input
              label="Purchase Price"
              value={editPurchasePrice}
              onChangeText={setEditPurchasePrice}
              keyboardType="decimal-pad"
              placeholder="0.00"
            />
          </View>

          <View className="mt-4 flex-row gap-2">
            <Button size="sm" onPress={handleSave} disabled={updateItem.isPending}>
              Save
            </Button>
            <Button variant="ghost" size="sm" onPress={() => setIsEditing(false)}>
              Cancel
            </Button>
          </View>
        </View>
      ) : (
        <View className="mb-4 rounded-xl bg-card p-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-semibold text-foreground">Your Card Details</Text>
            <Button variant="ghost" size="sm" onPress={handleStartEdit}>
              <Text className="text-xs text-primary">Edit</Text>
            </Button>
          </View>
          <View className="mt-2 gap-1">
            <Text className="text-xs text-muted-foreground">
              Condition: {CONDITION_LABELS[item.condition]}
            </Text>
            {gradingLabel && item.grading_score ? (
              <Text className="text-xs text-muted-foreground">
                Grading: {gradingLabel} {item.grading_score}
              </Text>
            ) : null}
            {item.acquired_at ? (
              <Text className="text-xs text-muted-foreground">
                Acquired: {item.acquired_at.slice(0, 10)}
              </Text>
            ) : null}
            {item.purchase_price != null ? (
              <Text className="text-xs text-muted-foreground">
                Purchase Price: ${item.purchase_price.toFixed(2)}
              </Text>
            ) : null}
          </View>
        </View>
      )}

      {/* 8. Notes */}
      <View className="mb-4 rounded-xl bg-card p-4">
        <Text className="mb-2 text-sm font-semibold text-foreground">Notes</Text>
        <TextInput
          className="min-h-[80px] rounded-lg border border-input bg-background p-3 text-sm text-foreground"
          multiline
          textAlignVertical="top"
          placeholder="Add personal notes..."
          placeholderTextColor="#9ca3af"
          value={notes}
          onChangeText={setNotes}
          onBlur={handleNotesBlur}
        />
      </View>

      {/* 9. Card Metadata */}
      {cardDetail ? (
        <View className="mb-4 rounded-xl bg-card p-4">
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

      {/* 10. Actions Row */}
      <View className="mb-12 gap-2">
        <Button variant="default" onPress={handleCreateListing}>
          Create Listing
        </Button>
        <Button variant="destructive" onPress={handleRemove}>
          Remove from Collection
        </Button>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
};

export default CardDetailScreen;
