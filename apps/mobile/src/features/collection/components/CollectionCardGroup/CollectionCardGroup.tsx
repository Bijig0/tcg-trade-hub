import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';
import Badge from '@/components/ui/Badge/Badge';
import {
  CONDITION_LABELS,
  GRADING_COMPANY_LABELS,
} from '@/config/constants';
import type { CollectionCardGroup as GroupType } from '../../utils/groupCollectionItems/groupCollectionItems';
import type { CollectionItemRow, GradingCompany } from '@tcg-trade-hub/database';

type CollectionCardGroupProps = {
  group: GroupType;
};

/**
 * Expandable card group row for the collection list.
 * Collapsed: card image, name, set, count badge, total value, chevron.
 * Expanded: plus indented list of individual cards with condition, grading, price.
 * Single-item groups auto-expand.
 */
const CollectionCardGroup: React.FC<CollectionCardGroupProps> = ({ group }) => {
  const router = useRouter();
  const isSingle = group.items.length === 1;
  const [isExpanded, setIsExpanded] = useState(isSingle);

  const handleHeaderPress = useCallback(() => {
    if (isSingle && group.items[0]) {
      router.push(`/(tabs)/(listings)/card-detail?id=${group.items[0].id}`);
    } else {
      setIsExpanded((prev) => !prev);
    }
  }, [isSingle, group.items, router]);

  const handleItemPress = useCallback((itemId: string) => {
    router.push(`/(tabs)/(listings)/card-detail?id=${itemId}`);
  }, [router]);

  const renderItem = (item: CollectionItemRow) => {
    const gradingLabel = item.grading_company
      ? GRADING_COMPANY_LABELS[item.grading_company as GradingCompany]
      : null;

    return (
      <Pressable
        key={item.id}
        className="ml-14 flex-row items-center border-t border-border py-2 pr-3"
        onPress={() => handleItemPress(item.id)}
      >
        <View className="flex-1">
          <View className="flex-row flex-wrap gap-1">
            <Badge variant="secondary">{CONDITION_LABELS[item.condition]}</Badge>
            {gradingLabel && item.grading_score ? (
              <Badge>{`${gradingLabel} ${item.grading_score}`}</Badge>
            ) : null}
            {(item.photos?.length ?? 0) > 0 ? (
              <Badge variant="outline">{`${item.photos.length} photo${item.photos.length !== 1 ? 's' : ''}`}</Badge>
            ) : null}
          </View>
        </View>
        <View className="items-end">
          <Text className="text-xs text-muted-foreground">x{item.quantity}</Text>
          {item.market_price != null ? (
            <Text className="text-sm font-medium text-green-600">
              ${item.market_price.toFixed(2)}
            </Text>
          ) : null}
        </View>
      </Pressable>
    );
  };

  return (
    <View className="mb-2 overflow-hidden rounded-xl bg-card">
      {/* Group header */}
      <Pressable
        className="flex-row items-center p-3"
        onPress={handleHeaderPress}
      >
        {group.image_url ? (
          <Image
            source={{ uri: group.image_url }}
            className="h-16 w-12 rounded-md"
            resizeMode="cover"
          />
        ) : (
          <View className="h-16 w-12 items-center justify-center rounded-md bg-muted">
            <Text className="text-xs text-muted-foreground">?</Text>
          </View>
        )}
        <View className="ml-3 flex-1">
          <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
            {group.card_name}
          </Text>
          <Text className="text-xs text-muted-foreground" numberOfLines={1}>
            {group.set_name} #{group.card_number}
          </Text>
          {group.rarity ? (
            <Text className="text-xs text-muted-foreground">{group.rarity}</Text>
          ) : null}
        </View>
        <View className="items-end">
          <Badge variant="secondary">{`x${group.totalCount}`}</Badge>
          {group.totalValue > 0 ? (
            <Text className="mt-1 text-sm font-medium text-green-600">
              ${group.totalValue.toFixed(2)}
            </Text>
          ) : null}
        </View>
        {!isSingle ? (
          <Text className="ml-2 text-muted-foreground">
            {isExpanded ? '\u25B2' : '\u25BC'}
          </Text>
        ) : null}
      </Pressable>

      {/* Expanded items */}
      {isExpanded && !isSingle ? (
        <View className="pb-1">
          {group.items.map(renderItem)}
        </View>
      ) : null}
    </View>
  );
};

export default CollectionCardGroup;
