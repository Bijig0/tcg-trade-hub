import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { Search, ArrowLeft } from 'lucide-react-native';
import Badge from '@/components/ui/Badge/Badge';
import useMyCollection from '@/features/collection/hooks/useMyCollection/useMyCollection';
import CardSearchInput from '../CardSearchInput/CardSearchInput';
import collectionItemToNormalizedCard from '../../utils/collectionItemToNormalizedCard/collectionItemToNormalizedCard';
import type { TcgType, CardCondition, NormalizedCard } from '@tcg-trade-hub/database';

type CollectionCardPickerProps = {
  tcg: TcgType | null;
  onSelect: (card: NormalizedCard, fromCollection: boolean, condition?: CardCondition) => void;
};

/**
 * Card picker that shows the user's collection first for WTS/WTT flows.
 *
 * Filters collection by the selected TCG. Falls back to external API search
 * when the user taps "Search for a different card".
 */
const CollectionCardPicker = ({ tcg, onSelect }: CollectionCardPickerProps) => {
  const { data: collection, isLoading } = useMyCollection();
  const [showExternalSearch, setShowExternalSearch] = useState(false);

  const filteredItems = useMemo(() => {
    if (!collection || !tcg) return [];
    return collection.filter((item) => item.tcg === tcg);
  }, [collection, tcg]);

  const handleExternalSelect = (card: NormalizedCard) => {
    onSelect(card, false);
  };

  if (showExternalSearch) {
    return (
      <View className="gap-4">
        <Pressable
          onPress={() => setShowExternalSearch(false)}
          className="flex-row items-center gap-2"
        >
          <ArrowLeft size={16} className="text-primary" />
          <Text className="text-sm font-medium text-primary">Back to my collection</Text>
        </Pressable>
        <CardSearchInput tcg={tcg} onSelect={handleExternalSelect} />
      </View>
    );
  }

  if (isLoading) {
    return (
      <View className="items-center py-8">
        <ActivityIndicator />
        <Text className="mt-2 text-sm text-muted-foreground">Loading your collection...</Text>
      </View>
    );
  }

  return (
    <View className="gap-4">
      <Text className="text-base text-muted-foreground">
        {filteredItems.length > 0
          ? 'Pick a card from your collection, or search for a different one.'
          : `No ${tcg ?? ''} cards in your collection.`}
      </Text>

      {filteredItems.map((item) => (
        <Pressable
          key={item.id}
          onPress={() => onSelect(collectionItemToNormalizedCard(item), true, item.condition)}
          className="flex-row items-center gap-3 rounded-xl border border-border bg-card p-3 active:bg-accent"
        >
          <Image
            source={{ uri: item.image_url }}
            className="h-16 w-11 rounded-lg bg-muted"
            contentFit="cover"
            cachePolicy="disk"
            transition={150}
          />
          <View className="flex-1 gap-0.5">
            <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
              {item.card_name}
            </Text>
            <Text className="text-xs text-muted-foreground" numberOfLines={1}>
              {item.set_name} &middot; #{item.card_number}
            </Text>
            <View className="mt-1 flex-row items-center gap-2">
              <Badge variant="outline">{item.condition.toUpperCase()}</Badge>
              {item.quantity > 1 && (
                <Text className="text-xs text-muted-foreground">x{item.quantity}</Text>
              )}
              {item.market_price != null && (
                <Text className="text-xs text-muted-foreground">
                  ${item.market_price.toFixed(2)}
                </Text>
              )}
            </View>
          </View>
        </Pressable>
      ))}

      <Pressable
        onPress={() => setShowExternalSearch(true)}
        className="flex-row items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3"
      >
        <Search size={16} className="text-primary" />
        <Text className="text-sm font-medium text-primary">Search for a different card</Text>
      </Pressable>
    </View>
  );
};

export default CollectionCardPicker;
