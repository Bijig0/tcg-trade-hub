import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Check } from 'lucide-react-native';
import { cn } from '@/lib/cn';
import type { ListingType } from '@tcg-trade-hub/database';

const TYPE_OPTIONS: { label: string; value: ListingType; description: string }[] = [
  { label: 'Want to Sell', value: 'wts', description: 'List cards you want to sell' },
  { label: 'Want to Buy', value: 'wtb', description: 'Looking for a specific card to buy' },
  { label: 'Want to Trade', value: 'wtt', description: 'Trade cards with other collectors' },
];

type TypeSelectStepProps = {
  selectedType: ListingType | null;
  onSelect: (type: ListingType) => void;
};

/**
 * Step 1 for all listing flows — choose WTS, WTB, or WTT.
 */
const TypeSelectStep = ({ selectedType, onSelect }: TypeSelectStepProps) => (
  <View className="gap-3">
    <Text className="mb-2 text-base text-muted-foreground">
      What do you want to do?
    </Text>
    {TYPE_OPTIONS.map((opt) => (
      <Pressable
        key={opt.value}
        onPress={() => onSelect(opt.value)}
        className={cn(
          'rounded-xl border p-4',
          selectedType === opt.value
            ? 'border-primary bg-primary/10'
            : 'border-border bg-card',
        )}
      >
        <Text className="text-base font-semibold text-foreground">{opt.label}</Text>
        <Text className="mt-1 text-sm text-muted-foreground">{opt.description}</Text>
        {selectedType === opt.value && (
          <View className="absolute right-3 top-3">
            <Check size={20} className="text-primary" />
          </View>
        )}
      </Pressable>
    ))}
  </View>
);

export default TypeSelectStep;
