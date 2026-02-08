import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, Pressable, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import useMyCollection from '../../hooks/useMyCollection/useMyCollection';
import useRemoveCollectionItem from '../../hooks/useRemoveCollectionItem/useRemoveCollectionItem';
import useAddCollectionItem from '../../hooks/useAddCollectionItem/useAddCollectionItem';
import parseCsvCollection from '../../utils/parseCsvCollection/parseCsvCollection';
import Button from '@/components/ui/Button/Button';
import Badge from '@/components/ui/Badge/Badge';
import EmptyState from '@/components/ui/EmptyState/EmptyState';
import { CONDITION_LABELS, TCG_LABELS } from '@/config/constants';
import type { CollectionItemRow, TcgType } from '@tcg-trade-hub/database';

type FilterTcg = TcgType | 'all';

const CollectionScreen: React.FC = () => {
  const router = useRouter();
  const { data: items, isLoading } = useMyCollection();
  const removeItem = useRemoveCollectionItem();
  const addItem = useAddCollectionItem();
  const [filterTcg, setFilterTcg] = useState<FilterTcg>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = (items ?? []).filter((item) => {
    if (filterTcg !== 'all' && item.tcg !== filterTcg) return false;
    if (searchQuery && !item.card_name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleRemove = useCallback((itemId: string) => {
    Alert.alert('Remove Card', 'Remove this card from your collection?', [
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
        `Found ${parsed.length} cards. They will need to be matched with card data. Import as Pokemon cards for now?`,
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

  const renderItem = ({ item }: { item: CollectionItemRow }) => (
    <Pressable
      className="mb-2 flex-row items-center rounded-xl bg-card p-3"
      onLongPress={() => handleRemove(item.id)}
    >
      {item.image_url ? (
        <Image source={{ uri: item.image_url }} className="h-16 w-12 rounded-md" resizeMode="cover" />
      ) : (
        <View className="h-16 w-12 items-center justify-center rounded-md bg-muted">
          <Text className="text-xs text-muted-foreground">?</Text>
        </View>
      )}
      <View className="ml-3 flex-1">
        <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
          {item.card_name}
        </Text>
        <Text className="text-xs text-muted-foreground" numberOfLines={1}>
          {item.set_name}
        </Text>
        <View className="mt-1 flex-row gap-2">
          <Badge variant="secondary">
            <Text className="text-xs">{CONDITION_LABELS[item.condition]}</Text>
          </Badge>
          <Text className="text-xs text-muted-foreground">x{item.quantity}</Text>
        </View>
      </View>
    </Pressable>
  );

  return (
    <View className="flex-1 bg-background px-4 pt-4">
      <View className="mb-4 flex-row gap-2">
        {(['all', 'pokemon', 'mtg', 'yugioh'] as const).map((tcg) => (
          <Pressable
            key={tcg}
            onPress={() => setFilterTcg(tcg)}
            className={`rounded-full px-3 py-1.5 ${filterTcg === tcg ? 'bg-primary' : 'bg-muted'}`}
          >
            <Text className={`text-xs font-medium ${filterTcg === tcg ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
              {tcg === 'all' ? 'All' : TCG_LABELS[tcg]}
            </Text>
          </Pressable>
        ))}
      </View>

      <View className="mb-4 flex-row gap-2">
        <Button variant="outline" size="sm" onPress={handleCsvImport}>
          <Text className="text-sm text-foreground">Import CSV</Text>
        </Button>
        <Button variant="outline" size="sm" onPress={() => Alert.alert('Coming Soon', 'TCGPlayer import coming soon!')}>
          <Text className="text-sm text-foreground">TCGPlayer</Text>
        </Button>
        <Button variant="outline" size="sm" onPress={() => Alert.alert('Coming Soon', 'Moxfield import coming soon!')}>
          <Text className="text-sm text-foreground">Moxfield</Text>
        </Button>
      </View>

      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <EmptyState
            icon={<Text className="text-4xl">📦</Text>}
            title="No cards yet"
            description="Import your collection or add cards manually."
          />
        }
      />
    </View>
  );
};

export default CollectionScreen;
