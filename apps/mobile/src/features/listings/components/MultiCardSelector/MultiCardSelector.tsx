import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { Check, Search } from 'lucide-react-native';
import { cn } from '@/lib/cn';
import Badge from '@/components/ui/Badge/Badge';
import useMyCollection from '@/features/collection/hooks/useMyCollection/useMyCollection';
import collectionItemToNormalizedCard from '../../utils/collectionItemToNormalizedCard/collectionItemToNormalizedCard';
import CardSearchInput from '../CardSearchInput/CardSearchInput';
import type { TcgType, CardCondition, NormalizedCard } from '@tcg-trade-hub/database';
import type { SelectedCard } from '../../schemas';

const CONDITION_OPTIONS: { label: string; value: CardCondition }[] = [
  { label: 'NM', value: 'nm' },
  { label: 'LP', value: 'lp' },
  { label: 'MP', value: 'mp' },
  { label: 'HP', value: 'hp' },
  { label: 'DMG', value: 'dmg' },
];

type MultiCardSelectorProps = {
  selectedCards: SelectedCard[];
  onToggle: (card: NormalizedCard, condition: CardCondition, fromCollection: boolean) => void;
};

/**
 * Step 2 for WTS and WTT flows.
 *
 * Displays the user's collection as selectable rows with checkboxes.
 * TCG filter pills at the top (derived from the user's collection TCGs).
 * "Add a card not in collection" expands an inline search with condition picker.
 */
const MultiCardSelector = ({ selectedCards, onToggle }: MultiCardSelectorProps) => {
  const { data: collection, isLoading } = useMyCollection();
  const [tcgFilter, setTcgFilter] = useState<TcgType | null>(null);
  const [showExternalSearch, setShowExternalSearch] = useState(false);
  const [externalCondition, setExternalCondition] = useState<CardCondition>('nm');
  const [externalTcg, setExternalTcg] = useState<TcgType | null>(null);

  const selectedIds = useMemo(
    () => new Set(selectedCards.map((sc) => sc.card.externalId)),
    [selectedCards],
  );

  // Derive available TCG filter options from collection
  const availableTcgs = useMemo(() => {
    if (!collection) return [];
    const tcgs = new Set(collection.map((item) => item.tcg));
    return Array.from(tcgs) as TcgType[];
  }, [collection]);

  const filteredItems = useMemo(() => {
    if (!collection) return [];
    if (!tcgFilter) return collection;
    return collection.filter((item) => item.tcg === tcgFilter);
  }, [collection, tcgFilter]);

  const TCG_LABELS: Record<TcgType, string> = {
    pokemon: 'Pokemon',
    mtg: 'MTG',
    yugioh: 'Yu-Gi-Oh!',
  };

  const handleExternalSelect = (card: NormalizedCard) => {
    onToggle(card, externalCondition, false);
  };

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
        Select cards from your collection.
      </Text>

      {/* Selected count */}
      {selectedCards.length > 0 && (
        <View className="flex-row items-center gap-2">
          <Badge variant="default">{`${selectedCards.length} selected`}</Badge>
        </View>
      )}

      {/* TCG filter pills */}
      {availableTcgs.length > 1 && (
        <View className="flex-row gap-2">
          <Pressable
            onPress={() => setTcgFilter(null)}
            className={cn(
              'rounded-full border px-3 py-1.5',
              tcgFilter === null
                ? 'border-primary bg-primary/10'
                : 'border-border bg-card',
            )}
          >
            <Text className={cn('text-sm', tcgFilter === null ? 'text-primary font-medium' : 'text-foreground')}>
              All
            </Text>
          </Pressable>
          {availableTcgs.map((tcg) => (
            <Pressable
              key={tcg}
              onPress={() => setTcgFilter(tcg)}
              className={cn(
                'rounded-full border px-3 py-1.5',
                tcgFilter === tcg
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-card',
              )}
            >
              <Text className={cn('text-sm', tcgFilter === tcg ? 'text-primary font-medium' : 'text-foreground')}>
                {TCG_LABELS[tcg]}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* Collection items as selectable rows */}
      {filteredItems.map((item) => {
        const isSelected = selectedIds.has(item.external_id);
        return (
          <Pressable
            key={item.id}
            onPress={() =>
              onToggle(
                collectionItemToNormalizedCard(item),
                item.condition,
                true,
              )
            }
            className={cn(
              'flex-row items-center gap-3 rounded-xl border p-3',
              isSelected
                ? 'border-primary bg-primary/5'
                : 'border-border bg-card active:bg-accent',
            )}
          >
            {/* Checkbox */}
            <View
              className={cn(
                'h-5 w-5 items-center justify-center rounded border',
                isSelected ? 'border-primary bg-primary' : 'border-muted-foreground',
              )}
            >
              {isSelected && <Check size={14} color="white" />}
            </View>

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
        );
      })}

      {filteredItems.length === 0 && !showExternalSearch && (
        <Text className="py-4 text-center text-sm text-muted-foreground">
          No cards in your collection{tcgFilter ? ` for ${TCG_LABELS[tcgFilter]}` : ''}.
        </Text>
      )}

      {/* External search section */}
      {showExternalSearch ? (
        <View className="gap-3 rounded-xl border border-border bg-card p-3">
          <Text className="text-sm font-medium text-foreground">Add a card not in your collection</Text>

          {/* TCG selector */}
          <View className="gap-1">
            <Text className="text-xs text-muted-foreground">TCG</Text>
            <View className="flex-row gap-2">
              {(['pokemon', 'mtg', 'yugioh'] as const).map((tcg) => (
                <Pressable
                  key={tcg}
                  onPress={() => setExternalTcg(tcg)}
                  className={cn(
                    'rounded-full border px-3 py-1',
                    externalTcg === tcg
                      ? 'border-primary bg-primary/10'
                      : 'border-border',
                  )}
                >
                  <Text
                    className={cn(
                      'text-xs',
                      externalTcg === tcg ? 'text-primary font-medium' : 'text-foreground',
                    )}
                  >
                    {TCG_LABELS[tcg]}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Condition picker */}
          <View className="gap-1">
            <Text className="text-xs text-muted-foreground">Condition</Text>
            <View className="flex-row gap-2">
              {CONDITION_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.value}
                  onPress={() => setExternalCondition(opt.value)}
                  className={cn(
                    'rounded-full border px-3 py-1',
                    externalCondition === opt.value
                      ? 'border-primary bg-primary/10'
                      : 'border-border',
                  )}
                >
                  <Text
                    className={cn(
                      'text-xs',
                      externalCondition === opt.value ? 'text-primary font-medium' : 'text-foreground',
                    )}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <CardSearchInput tcg={externalTcg} onSelect={handleExternalSelect} />

          <Pressable onPress={() => setShowExternalSearch(false)}>
            <Text className="text-center text-sm text-muted-foreground">Cancel</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable
          onPress={() => {
            setExternalTcg(tcgFilter);
            setShowExternalSearch(true);
          }}
          className="flex-row items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3"
        >
          <Search size={16} className="text-primary" />
          <Text className="text-sm font-medium text-primary">Add a card not in collection</Text>
        </Pressable>
      )}
    </View>
  );
};

export default MultiCardSelector;
