import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  FlatList,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Check, Search } from 'lucide-react-native';
import Badge from '@/components/ui/Badge/Badge';
import Button from '@/components/ui/Button/Button';
import { CONDITION_LABELS } from '@/config/constants';
import { collectionItemToTradeItem } from '../../utils/toCardRef/toCardRef';
import type { CollectionItemRow } from '@tcg-trade-hub/database';
import type { TradeContextItem } from '../../hooks/useTradeContext/useTradeContext';

export type CardPickerModalProps = {
  visible: boolean;
  onClose: () => void;
  collection: CollectionItemRow[];
  isLoading: boolean;
  selectedExternalIds: Set<string>;
  onConfirm: (items: TradeContextItem[]) => void;
  title: string;
};

/** Full-screen modal showing a user's tradeable collection with multi-select */
const CardPickerModal = ({
  visible,
  onClose,
  collection,
  isLoading,
  selectedExternalIds,
  onConfirm,
  title,
}: CardPickerModalProps) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  // Sync internal selection when modal opens
  React.useEffect(() => {
    if (visible) {
      // Map external IDs to collection item IDs
      const initialIds = new Set<string>();
      for (const item of collection) {
        if (selectedExternalIds.has(item.external_id)) {
          initialIds.add(item.id);
        }
      }
      setSelectedIds(initialIds);
      setSearchQuery('');
    }
  }, [visible, collection, selectedExternalIds]);

  const filteredCollection = useMemo(() => {
    if (!searchQuery.trim()) return collection;
    const q = searchQuery.toLowerCase();
    return collection.filter((c) => c.card_name.toLowerCase().includes(q));
  }, [collection, searchQuery]);

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectedTotal = useMemo(() => {
    let total = 0;
    for (const item of collection) {
      if (selectedIds.has(item.id)) {
        total += (item.market_price ?? 0) * item.quantity;
      }
    }
    return total;
  }, [collection, selectedIds]);

  const handleConfirm = useCallback(() => {
    const selected = collection.filter((c) => selectedIds.has(c.id));
    const items = selected.map(collectionItemToTradeItem);
    onConfirm(items);
  }, [collection, selectedIds, onConfirm]);

  const renderCard = useCallback(
    ({ item }: { item: CollectionItemRow }) => {
      const isSelected = selectedIds.has(item.id);

      return (
        <Pressable
          onPress={() => toggleSelection(item.id)}
          className={`mb-2 flex-row items-center rounded-xl p-2 ${
            isSelected
              ? 'border border-primary bg-primary/10'
              : 'border border-transparent bg-card'
          }`}
        >
          {item.image_url ? (
            <Image
              source={{ uri: item.image_url }}
              className="h-14 w-10 rounded"
              contentFit="cover"
              cachePolicy="disk"
              transition={150}
            />
          ) : (
            <View className="h-14 w-10 items-center justify-center rounded bg-muted">
              <Text className="text-[8px] text-muted-foreground">?</Text>
            </View>
          )}
          <View className="ml-2 flex-1">
            <Text
              className="text-sm font-medium text-foreground"
              numberOfLines={1}
            >
              {item.card_name}
            </Text>
            <View className="flex-row items-center gap-1">
              <Badge variant="secondary">
                {CONDITION_LABELS[item.condition]}
              </Badge>
              {item.market_price != null && (
                <Text className="text-xs text-muted-foreground">
                  ${item.market_price.toFixed(2)}
                </Text>
              )}
            </View>
          </View>
          {isSelected && (
            <View className="h-5 w-5 items-center justify-center rounded-full bg-primary">
              <Check size={12} color="white" />
            </View>
          )}
        </Pressable>
      );
    },
    [selectedIds, toggleSelection],
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        {/* Header */}
        <View className="flex-row items-center justify-between border-b border-border px-4 py-3">
          <Pressable onPress={onClose} className="p-1 active:opacity-70" hitSlop={8}>
            <X size={24} color="#6b7280" />
          </Pressable>
          <Text className="text-base font-semibold text-foreground">
            {title}
          </Text>
          <Text className="text-sm text-muted-foreground">
            {selectedIds.size} selected
          </Text>
        </View>

        {/* Search */}
        <View className="border-b border-border px-4 py-2">
          <View className="flex-row items-center gap-2 rounded-lg bg-muted px-3 py-2">
            <Search size={16} color="#9ca3af" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search cards..."
              placeholderTextColor="#9ca3af"
              className="flex-1 text-sm text-foreground"
            />
          </View>
        </View>

        {/* Card list */}
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
          </View>
        ) : (
          <FlatList
            data={filteredCollection}
            keyExtractor={(item) => item.id}
            renderItem={renderCard}
            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 }}
            ListEmptyComponent={
              <Text className="py-8 text-center text-sm text-muted-foreground">
                {searchQuery ? 'No cards match your search' : 'No tradeable cards'}
              </Text>
            }
          />
        )}

        {/* Sticky footer */}
        <View className="border-t border-border bg-background px-4 pb-6 pt-3">
          <Text className="mb-2 text-center text-sm text-muted-foreground">
            Total value: ${selectedTotal.toFixed(2)}
          </Text>
          <Button size="lg" onPress={handleConfirm} className="w-full">
            Confirm ({selectedIds.size})
          </Button>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default CardPickerModal;
