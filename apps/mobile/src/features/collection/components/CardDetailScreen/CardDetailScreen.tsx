import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import useMyCollection from '../../hooks/useMyCollection/useMyCollection';
import useMyWishlist from '../../hooks/useMyWishlist/useMyWishlist';
import useMySealedProducts from '../../hooks/useMySealedProducts/useMySealedProducts';
import useCardDetail from '../../hooks/useCardDetail/useCardDetail';
import useUpdateCollectionItem from '../../hooks/useUpdateCollectionItem/useUpdateCollectionItem';
import useRemoveCollectionItem from '../../hooks/useRemoveCollectionItem/useRemoveCollectionItem';
import Button from '@/components/ui/Button/Button';
import Badge from '@/components/ui/Badge/Badge';
import Select from '@/components/ui/Select/Select';
import {
  CONDITION_LABELS,
  GRADING_COMPANY_LABELS,
  SEALED_PRODUCT_TYPE_LABELS,
} from '@/config/constants';
import type { CollectionItemRow, GradingCompany, SealedProductType } from '@tcg-trade-hub/database';
import type { PriceVariant } from '@/services/cardData';

const CONDITION_OPTIONS = Object.entries(CONDITION_LABELS).map(([value, label]) => ({
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

  const [isEditing, setIsEditing] = useState(false);
  const [editCondition, setEditCondition] = useState(item?.condition ?? 'nm');
  const [editQuantity, setEditQuantity] = useState(item?.quantity ?? 1);

  const handleSave = useCallback(() => {
    if (!item) return;
    updateItem.mutate(
      {
        id: item.id,
        updates: {
          condition: editCondition as CollectionItemRow['condition'],
          quantity: editQuantity,
        },
      },
      {
        onSuccess: () => setIsEditing(false),
      },
    );
  }, [item, editCondition, editQuantity, updateItem]);

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
  const sealedLabel = item.product_type
    ? SEALED_PRODUCT_TYPE_LABELS[item.product_type as SealedProductType]
    : null;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
    <ScrollView className="flex-1 px-4 pt-6">
      <View className="mb-4 flex-row items-center">
        <Button variant="ghost" size="sm" onPress={() => router.back()}>
          <Text className="text-sm text-primary">Back</Text>
        </Button>
      </View>

      {/* Card image */}
      <View className="mb-4 items-center">
        {item.image_url ? (
          <Image
            source={{ uri: item.image_url }}
            className="h-72 w-48 rounded-xl"
            resizeMode="contain"
          />
        ) : (
          <View className="h-72 w-48 items-center justify-center rounded-xl bg-muted">
            <Text className="text-2xl text-muted-foreground">?</Text>
          </View>
        )}
      </View>

      {/* Card info */}
      <Text className="text-center text-xl font-bold text-foreground">{item.card_name}</Text>
      <Text className="mb-2 text-center text-sm text-muted-foreground">
        {item.set_name} #{item.card_number}
      </Text>

      <View className="mb-4 flex-row flex-wrap justify-center gap-2">
        <Badge variant="secondary">{CONDITION_LABELS[item.condition]}</Badge>
        {item.is_wishlist ? <Badge variant="outline">Wishlist</Badge> : null}
        {item.is_sealed && sealedLabel ? <Badge variant="outline">{sealedLabel}</Badge> : null}
        {gradingLabel && item.grading_score ? (
          <Badge>{`${gradingLabel} ${item.grading_score}`}</Badge>
        ) : null}
        <Badge variant="secondary">{`x${item.quantity}`}</Badge>
      </View>

      {/* Market prices */}
      {item.market_price != null ? (
        <View className="mb-4 rounded-xl bg-card p-4">
          <Text className="mb-2 text-sm font-semibold text-foreground">Market Price</Text>
          <Text className="text-2xl font-bold text-green-600">
            ${item.market_price.toFixed(2)}
          </Text>
          {item.quantity > 1 ? (
            <Text className="text-sm text-muted-foreground">
              Total: ${(item.market_price * item.quantity).toFixed(2)}
            </Text>
          ) : null}
        </View>
      ) : null}

      {/* Detailed prices from adapter */}
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

      {/* Purchase price for sealed */}
      {item.purchase_price != null ? (
        <View className="mb-4 rounded-xl bg-card p-4">
          <Text className="mb-1 text-sm font-semibold text-foreground">Purchase Price</Text>
          <Text className="text-lg font-bold text-foreground">
            ${item.purchase_price.toFixed(2)}
          </Text>
        </View>
      ) : null}

      {/* Edit section */}
      {isEditing ? (
        <View className="mb-4 rounded-xl bg-card p-4">
          <Text className="mb-3 text-sm font-semibold text-foreground">Edit</Text>
          <Select
            label="Condition"
            value={editCondition}
            onValueChange={setEditCondition}
            options={CONDITION_OPTIONS}
          />
          <View className="mt-3">
            <Text className="mb-1.5 text-sm font-medium text-foreground">Quantity</Text>
            <View className="flex-row items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onPress={() => setEditQuantity(Math.max(1, editQuantity - 1))}
              >
                <Text className="text-foreground">-</Text>
              </Button>
              <Text className="min-w-[32px] text-center text-lg font-semibold text-foreground">
                {editQuantity}
              </Text>
              <Button
                variant="outline"
                size="sm"
                onPress={() => setEditQuantity(Math.min(99, editQuantity + 1))}
              >
                <Text className="text-foreground">+</Text>
              </Button>
            </View>
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
      ) : null}

      {/* Actions */}
      <View className="mb-12 gap-2">
        {!isEditing ? (
          <Button variant="outline" onPress={() => {
            setEditCondition(item.condition);
            setEditQuantity(item.quantity);
            setIsEditing(true);
          }}>
            Edit
          </Button>
        ) : null}
        <Button variant="destructive" onPress={handleRemove}>
          Remove from Collection
        </Button>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
};

export default CardDetailScreen;
