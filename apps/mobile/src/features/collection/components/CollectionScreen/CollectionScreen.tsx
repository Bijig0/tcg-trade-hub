import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl, ScrollView, Pressable, Image, Alert, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { Search, X } from 'lucide-react-native';
import useMyCollection from '../../hooks/useMyCollection/useMyCollection';
import useMySealedProducts from '../../hooks/useMySealedProducts/useMySealedProducts';
import usePortfolioValue from '../../hooks/usePortfolioValue/usePortfolioValue';
import useRemoveCollectionItem from '../../hooks/useRemoveCollectionItem/useRemoveCollectionItem';
import { collectionKeys } from '../../queryKeys';
import groupCollectionItems from '../../utils/groupCollectionItems/groupCollectionItems';
import CollectionCardGroup from '../CollectionCardGroup/CollectionCardGroup';
import Button from '@/components/ui/Button/Button';
import Badge from '@/components/ui/Badge/Badge';
import EmptyState from '@/components/ui/EmptyState/EmptyState';
import {
  CONDITION_LABELS,
  TCG_LABELS,
  GRADING_COMPANY_LABELS,
  SEALED_PRODUCT_TYPE_LABELS,
} from '@/config/constants';
import type {
  CollectionItemRow,
  TcgType,
  GradingCompany,
  SealedProductType,
} from '@tcg-trade-hub/database';

type FilterTcg = TcgType | 'all';
type Tab = 'cards' | 'sealed';

const TABS: { key: Tab; label: string }[] = [
  { key: 'cards', label: 'Cards' },
  { key: 'sealed', label: 'Sealed' },
];

const CollectionScreen: React.FC = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: collection } = useMyCollection();
  const { data: sealed } = useMySealedProducts();
  const portfolio = usePortfolioValue();
  const removeItem = useRemoveCollectionItem();

  const [activeTab, setActiveTab] = useState<Tab>('cards');
  const [filterTcg, setFilterTcg] = useState<FilterTcg>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: collectionKeys.all });
    } finally {
      setIsRefreshing(false);
    }
  }, [queryClient]);

  const currentItems = activeTab === 'cards' ? collection : sealed;

  const filteredItems = useMemo(() => {
    const items = currentItems ?? [];
    const lowerQuery = searchQuery.toLowerCase().trim();

    return items.filter((item) => {
      if (filterTcg !== 'all' && item.tcg !== filterTcg) return false;
      if (lowerQuery.length > 0) {
        const matchesName = item.card_name.toLowerCase().includes(lowerQuery);
        const matchesSet = item.set_name?.toLowerCase().includes(lowerQuery) ?? false;
        if (!matchesName && !matchesSet) return false;
      }
      return true;
    });
  }, [currentItems, filterTcg, searchQuery]);

  const groupedCards = useMemo(
    () => (activeTab === 'cards' ? groupCollectionItems(filteredItems) : []),
    [activeTab, filteredItems],
  );

  const handleRemove = useCallback((itemId: string) => {
    Alert.alert('Remove', 'Remove this item?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeItem.mutate(itemId) },
    ]);
  }, [removeItem]);

  const handleCsvImport = useCallback(() => {
    router.push('/(tabs)/(listings)/csv-import');
  }, [router]);

  const handleAddPress = useCallback(() => {
    if (activeTab === 'sealed') {
      router.push('/(tabs)/(listings)/add-sealed');
    } else {
      router.push('/(tabs)/(listings)/add-card?mode=collection');
    }
  }, [activeTab, router]);

  const handleItemPress = useCallback((itemId: string) => {
    router.push(`/(tabs)/(listings)/card-detail?id=${itemId}`);
  }, [router]);

  const renderFlatItem = ({ item }: { item: CollectionItemRow }) => {
    const gradingLabel = item.grading_company
      ? GRADING_COMPANY_LABELS[item.grading_company as GradingCompany]
      : null;
    const sealedLabel = item.product_type
      ? SEALED_PRODUCT_TYPE_LABELS[item.product_type as SealedProductType]
      : null;

    return (
      <Pressable
        className="mb-2 flex-row items-center rounded-xl bg-card p-3"
        onPress={() => handleItemPress(item.id)}
        onLongPress={() => handleRemove(item.id)}
      >
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} className="h-16 w-12 rounded-md" resizeMode="cover" />
        ) : (
          <View className="h-16 w-12 items-center justify-center rounded-md bg-muted">
            <Text className="text-xs text-muted-foreground">
              {item.is_sealed ? 'S' : '?'}
            </Text>
          </View>
        )}
        <View className="ml-3 flex-1">
          <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
            {item.card_name}
          </Text>
          {item.set_name ? (
            <Text className="text-xs text-muted-foreground" numberOfLines={1}>
              {item.set_name}
            </Text>
          ) : null}
          <View className="mt-1 flex-row flex-wrap gap-1">
            <Badge variant="secondary">{CONDITION_LABELS[item.condition]}</Badge>
            {gradingLabel && item.grading_score ? (
              <Badge>{`${gradingLabel} ${item.grading_score}`}</Badge>
            ) : null}
            {sealedLabel ? <Badge variant="outline">{sealedLabel}</Badge> : null}
          </View>
        </View>
        <View className="items-end">
          <Text className="text-xs text-muted-foreground">x{item.quantity}</Text>
          {item.market_price != null ? (
            <Text className="text-sm font-medium text-green-600">
              ${item.market_price.toFixed(2)}
            </Text>
          ) : item.purchase_price != null ? (
            <Text className="text-sm font-medium text-foreground">
              ${item.purchase_price.toFixed(2)}
            </Text>
          ) : null}
        </View>
      </Pressable>
    );
  };

  const addLabel = activeTab === 'sealed' ? '+ Add Sealed' : '+ Add Card';
  const emptyTitle = activeTab === 'cards' ? 'No cards yet' : 'No sealed products';
  const emptyDesc = activeTab === 'cards'
    ? 'Add cards to track your collection and market value.'
    : 'Track your sealed products and their value.';

  const isEmpty = activeTab === 'cards'
    ? groupedCards.length === 0
    : filteredItems.length === 0;

  return (
    <View className="flex-1 bg-background">
    <View className="flex-1 px-4 pt-4">
      {/* Portfolio Value Header */}
      <View className="mb-4 rounded-xl bg-card p-4">
        <View className="flex-row items-baseline justify-between">
          <View>
            <Text className="text-xs text-muted-foreground">Portfolio Value</Text>
            <Text className="text-2xl font-bold text-foreground">
              ${portfolio.totalValue.toFixed(2)}
            </Text>
          </View>
          <Text className="text-sm text-muted-foreground">
            {portfolio.totalCards} items
          </Text>
        </View>
      </View>

      {/* Search Bar */}
      <View className="mb-3 flex-row items-center rounded-lg border border-input bg-background px-3 py-2">
        <Search size={16} className="text-muted-foreground" />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by name or set..."
          className="ml-2 flex-1 text-sm text-foreground"
          placeholderTextColor="#a1a1aa"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
            <X size={16} className="text-muted-foreground" />
          </Pressable>
        )}
      </View>

      {/* Segmented Control: Cards / Sealed */}
      <View className="mb-3 flex-row rounded-lg bg-muted p-1">
        {TABS.map((tab) => (
          <Pressable
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            className={`flex-1 rounded-md py-2 ${activeTab === tab.key ? 'bg-background' : ''}`}
          >
            <Text
              className={`text-center text-sm font-medium ${
                activeTab === tab.key ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* TCG Filter Chips */}
      <View className="mb-3 flex-row gap-2">
        {(['all', 'pokemon', 'mtg', 'yugioh'] as const).map((tcg) => (
          <Pressable
            key={tcg}
            onPress={() => setFilterTcg(tcg)}
            className={`rounded-full px-3 py-1.5 ${filterTcg === tcg ? 'bg-primary' : 'bg-muted'}`}
          >
            <Text
              className={`text-xs font-medium ${
                filterTcg === tcg ? 'text-primary-foreground' : 'text-muted-foreground'
              }`}
            >
              {tcg === 'all' ? 'All' : TCG_LABELS[tcg]}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Action Row */}
      <View className="mb-3 flex-row gap-2">
        <Button variant="default" size="sm" onPress={handleAddPress}>
          {addLabel}
        </Button>
        {activeTab === 'cards' ? (
          <Button variant="outline" size="sm" onPress={handleCsvImport}>
            <Text className="text-sm text-foreground">Import CSV</Text>
          </Button>
        ) : null}
      </View>

      {/* Card List */}
      {isEmpty ? (
        <EmptyState
          icon={<Text className="text-4xl">{activeTab === 'sealed' ? 'S' : 'C'}</Text>}
          title={emptyTitle}
          description={emptyDesc}
          action={{ label: addLabel, onPress: handleAddPress }}
        />
      ) : activeTab === 'cards' ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
          }
        >
          {groupedCards.map((group) => (
            <CollectionCardGroup key={group.groupKey} group={group} />
          ))}
        </ScrollView>
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          renderItem={renderFlatItem}
          onRefresh={onRefresh}
          refreshing={isRefreshing}
        />
      )}
    </View>
    </View>
  );
};

export default CollectionScreen;
