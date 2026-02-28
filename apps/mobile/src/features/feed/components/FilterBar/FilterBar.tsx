import React, { useState, useMemo } from 'react';
import { ScrollView, Pressable, Text, View } from 'react-native';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { cn } from '@/lib/cn';
import { useFeedStore } from '@/stores/feedStore/feedStore';
import type { TcgType, CardCondition, ListingCategory } from '@tcg-trade-hub/database';

const TCG_OPTIONS: { label: string; value: TcgType | null }[] = [
  { label: 'All TCGs', value: null },
  { label: 'Pokemon', value: 'pokemon' },
  { label: 'MTG', value: 'mtg' },
  { label: 'One Piece', value: 'onepiece' },
];

const CATEGORY_OPTIONS: { label: string; value: ListingCategory | null }[] = [
  { label: 'All', value: null },
  { label: 'Singles', value: 'singles' },
  { label: 'Sealed', value: 'sealed' },
  { label: 'Graded', value: 'graded' },
  { label: 'Bulk', value: 'bulk' },
];

const CONDITION_OPTIONS: { label: string; value: CardCondition | null }[] = [
  { label: 'Any Condition', value: null },
  { label: 'NM', value: 'nm' },
  { label: 'LP', value: 'lp' },
  { label: 'MP', value: 'mp' },
  { label: 'HP', value: 'hp' },
  { label: 'DMG', value: 'dmg' },
];

const SORT_OPTIONS: { label: string; value: 'relevance' | 'distance' | 'price' | 'newest' }[] = [
  { label: 'Relevance', value: 'relevance' },
  { label: 'Distance', value: 'distance' },
  { label: 'Price', value: 'price' },
  { label: 'Newest', value: 'newest' },
];

export type FilterChipProps = {
  label: string;
  active: boolean;
  onPress: () => void;
};

const FilterChip = ({ label, active, onPress }: FilterChipProps) => (
  <Pressable
    onPress={onPress}
    className={cn(
      'mr-2 rounded-full border px-3 py-1.5',
      active
        ? 'border-primary bg-primary'
        : 'border-border bg-card',
    )}
  >
    <Text
      className={cn(
        'text-xs font-medium',
        active ? 'text-primary-foreground' : 'text-foreground',
      )}
    >
      {label}
    </Text>
  </Pressable>
);

export type FilterBarProps = {
  className?: string;
};

/**
 * Horizontal scrollable filter chips with searcher-intent pills.
 *
 * Row 1: [Buying] [Trading] | [All TCGs] [Pokemon] [MTG] [One Piece]
 * Row 2: [All] [Singles] [Sealed] [Graded] [Bulk]
 * Row 3 (collapsed): [Any Condition] [NM] [LP] ... | [Relevance] [Distance] ...
 */
const FilterBar = ({ className }: FilterBarProps) => {
  const filters = useFeedStore((s) => s.filters);
  const setFilter = useFeedStore((s) => s.setFilter);
  const toggleWantToBuy = useFeedStore((s) => s.toggleWantToBuy);
  const toggleWantToTrade = useFeedStore((s) => s.toggleWantToTrade);
  const setCategory = useFeedStore((s) => s.setCategory);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const advancedFilterCount = useMemo(() => {
    let count = 0;
    if (filters.condition) count++;
    if (filters.sort !== 'relevance') count++;
    return count;
  }, [filters.condition, filters.sort]);

  return (
    <View className={cn('gap-2', className)}>
      {/* Row 1: Intent + TCG */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="px-4 py-2"
      >
        <FilterChip
          label="Buying"
          active={filters.wantToBuy}
          onPress={toggleWantToBuy}
        />
        <FilterChip
          label="Trading"
          active={filters.wantToTrade}
          onPress={toggleWantToTrade}
        />

        <View className="mx-1 w-px bg-border" />

        {TCG_OPTIONS.map((opt) => (
          <FilterChip
            key={`tcg-${opt.value}`}
            label={opt.label}
            active={filters.tcg === opt.value}
            onPress={() => setFilter('tcg', opt.value)}
          />
        ))}
      </ScrollView>

      {/* Row 2: Category + Advanced toggle */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="px-4 pb-2"
      >
        {CATEGORY_OPTIONS.map((opt) => (
          <FilterChip
            key={`cat-${opt.value}`}
            label={opt.label}
            active={filters.category === opt.value}
            onPress={() => setCategory(opt.value)}
          />
        ))}

        <View className="mx-1 w-px bg-border" />

        <Pressable
          onPress={() => setShowAdvanced((prev) => !prev)}
          className={cn(
            'mr-2 flex-row items-center rounded-full border px-3 py-1.5',
            showAdvanced || advancedFilterCount > 0
              ? 'border-primary bg-primary/10'
              : 'border-border bg-card',
          )}
        >
          <Text
            className={cn(
              'text-xs font-medium',
              showAdvanced || advancedFilterCount > 0
                ? 'text-primary'
                : 'text-foreground',
            )}
          >
            Filters{advancedFilterCount > 0 ? ` (${advancedFilterCount})` : ''}
          </Text>
          {showAdvanced ? (
            <ChevronUp size={12} className="ml-1 text-muted-foreground" />
          ) : (
            <ChevronDown size={12} className="ml-1 text-muted-foreground" />
          )}
        </Pressable>
      </ScrollView>

      {/* Row 3: Advanced (condition + sort) — collapsed by default */}
      {showAdvanced && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="px-4 pb-2"
        >
          {CONDITION_OPTIONS.map((opt) => (
            <FilterChip
              key={`cond-${opt.value}`}
              label={opt.label}
              active={filters.condition === opt.value}
              onPress={() => setFilter('condition', opt.value)}
            />
          ))}

          <View className="mx-1 w-px bg-border" />

          {SORT_OPTIONS.map((opt) => (
            <FilterChip
              key={`sort-${opt.value}`}
              label={opt.label}
              active={filters.sort === opt.value}
              onPress={() => setFilter('sort', opt.value)}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default FilterBar;
