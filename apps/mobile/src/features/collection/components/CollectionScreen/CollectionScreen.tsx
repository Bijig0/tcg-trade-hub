import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, Pressable, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import useMyCollection from '../../hooks/useMyCollection/useMyCollection';
import useMyWishlist from '../../hooks/useMyWishlist/useMyWishlist';
import useMySealedProducts from '../../hooks/useMySealedProducts/useMySealedProducts';
import usePortfolioValue from '../../hooks/usePortfolioValue/usePortfolioValue';
import useRemoveCollectionItem from '../../hooks/useRemoveCollectionItem/useRemoveCollectionItem';
import useAddCollectionItem from '../../hooks/useAddCollectionItem/useAddCollectionItem';
import parseCsvCollection from '../../utils/parseCsvCollection/parseCsvCollection';
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
type Tab = 'cards' | 'wishlist' | 'sealed';

const TABS: { key: Tab; label: string }[] = [
  { key: 'cards', label: 'Cards' },
  { key: 'wishlist', label: 'Wishlist' },
  { key: 'sealed', label: 'Sealed' },
];

const CollectionScreen: React.FC = () => {
  const router = useRouter();
  const { data: collection } = useMyCollection();
  const { data: wishlist } = useMyWishlist();
  const { data: sealed } = useMySealedProducts();
  const portfolio = usePortfolioValue();
  const removeItem = useRemoveCollectionItem();
  const addItem = useAddCollectionItem();

  const [activeTab, setActiveTab] = useState<Tab>('cards');
  const [filterTcg, setFilterTcg] = useState<FilterTcg>('all');

  const currentItems = activeTab === 'cards'
    ? collection
    : activeTab === 'wishlist'
      ? wishlist
      : sealed;

  const filteredItems = (currentItems ?? []).filter((item) => {
    if (filterTcg !== 'all' && item.tcg !== filterTcg) return false;
    return true;
  });

  const handleRemove = useCallback((itemId: string) => {
    Alert.alert('Remove', 'Remove this item?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeItem.mutate(itemId) },
    ]);
  }, [removeItem]);

  const handleCsvImport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'text/csv' });
      if (result.canceled || !result.assets?.[0]) return;

      const fileUri = result.assets[0].uri;
      const csvText = await FileSystem.readAsStringAsync(fileUri);
      const parsed = parseCsvCollection(csvText);

      if (parsed.length === 0) {
        Alert.alert('Import Failed', 'No valid card data found in the CSV file.');
        return;
      }

      Alert.alert(
        'Import Collection',
        `Found ${parsed.length} cards. Import as Pokemon cards?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Import',
            onPress: () => {
              for (const card of parsed) {
                addItem.mutate({
                  tcg: 'pokemon',
                  external_id: `csv-${card.card_name}-${card.set_name}`,
                  card_name: card.card_name,
                  set_name: card.set_name,
                  set_code: '',
                  card_number: card.card_number,
                  image_url: '',
                  condition: card.condition,
                  quantity: card.quantity,
                });
              }
              Alert.alert('Success', `Imported ${parsed.length} cards.`);
            },
          },
        ],
      );
    } catch {
      Alert.alert('Error', 'Failed to read the CSV file.');
    }
  };

  const handleAddPress = useCallback(() => {
    if (activeTab === 'sealed') {
      router.push('/(tabs)/(listings)/add-sealed');
    } else {
      const mode = activeTab === 'wishlist' ? 'wishlist' : 'collection';
      router.push(`/(tabs)/(listings)/add-card?mode=${mode}`);
    }
  }, [activeTab, router]);

  const handleItemPress = useCallback((itemId: string) => {
    router.push(`/(tabs)/(listings)/card-detail?id=${itemId}`);
  }, [router]);

  const renderItem = ({ item }: { item: CollectionItemRow }) => {
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
  const emptyTitle = activeTab === 'cards'
    ? 'No cards yet'
    : activeTab === 'wishlist'
      ? 'Wishlist is empty'
      : 'No sealed products';
  const emptyDesc = activeTab === 'cards'
    ? 'Add cards to track your collection and market value.'
    : activeTab === 'wishlist'
      ? 'Add cards you want to find matching listings.'
      : 'Track your sealed products and their value.';

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

      {/* Segmented Control: Cards / Wishlist / Sealed */}
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
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <EmptyState
            icon={<Text className="text-4xl">{activeTab === 'sealed' ? 'S' : 'C'}</Text>}
            title={emptyTitle}
            description={emptyDesc}
            action={{ label: addLabel, onPress: handleAddPress }}
          />
        }
      />
    </View>
    </View>
  );
};

export default CollectionScreen;
