import React from 'react';
import { ScrollView, Pressable, Text, View } from 'react-native';
import { cn } from '@/lib/cn';
import { useFeedStore } from '@/stores/feedStore/feedStore';
import type { TcgType, ListingType, CardCondition } from '@tcg-trade-hub/database';

const TCG_OPTIONS: { label: string; value: TcgType | null }[] = [
  { label: 'All TCGs', value: null },
  { label: 'Pokemon', value: 'pokemon' },
  { label: 'MTG', value: 'mtg' },
  { label: 'Yu-Gi-Oh', value: 'yugioh' },
];

const TYPE_OPTIONS: { label: string; value: ListingType }[] = [
  { label: 'WTS', value: 'wts' },
  { label: 'WTB', value: 'wtb' },
  { label: 'WTT', value: 'wtt' },
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
 * Horizontal scrollable row of filter chips for TCG, listing type, condition,
 * and sort order. Reads and updates filters via useFeedStore.
 *
 * Listing type uses multi-select toggle: empty = show all, any selected = show only those.
 */
const FilterBar = ({ className }: FilterBarProps) => {
  const filters = useFeedStore((s) => s.filters);
  const setFilter = useFeedStore((s) => s.setFilter);
  const toggleListingType = useFeedStore((s) => s.toggleListingType);

  return (
    <View className={cn('gap-2', className)}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="px-4 py-2"
      >
        {TCG_OPTIONS.map((opt) => (
          <FilterChip
            key={`tcg-${opt.value}`}
            label={opt.label}
            active={filters.tcg === opt.value}
            onPress={() => setFilter('tcg', opt.value)}
          />
        ))}

        <View className="mx-1 w-px bg-border" />

        {TYPE_OPTIONS.map((opt) => (
          <FilterChip
            key={`type-${opt.value}`}
            label={opt.label}
            active={filters.listingTypes.includes(opt.value)}
            onPress={() => toggleListingType(opt.value)}
          />
        ))}
      </ScrollView>

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
    </View>
  );
};

export default FilterBar;
