import React, { useState } from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import { X, Plus, Package, Award, Layers, DollarSign, MessageCircle, Sparkles } from 'lucide-react-native';
import Button from '@/components/ui/Button/Button';
import type { TradeWant } from '@tcg-trade-hub/database';

type TradeWantsStepProps = {
  tradeWants: TradeWant[];
  onAdd: (want: TradeWant) => void;
  onRemove: (index: number) => void;
};

const WANT_TYPE_OPTIONS = [
  { type: 'open_to_offers' as const, label: 'Open to Offers', icon: Sparkles },
  { type: 'cash' as const, label: 'Cash', icon: DollarSign },
  { type: 'sealed' as const, label: 'Sealed Product', icon: Package },
  { type: 'slab' as const, label: 'Graded Slab', icon: Award },
  { type: 'raw_cards' as const, label: 'Raw Cards', icon: Layers },
  { type: 'custom' as const, label: 'Custom Tag', icon: MessageCircle },
];

/**
 * Step in the WTT listing creation flow where users specify what they're looking for.
 * Provides quick-pick buttons for common trade want types and a custom tag input.
 */
const TradeWantsStep = ({ tradeWants, onAdd, onRemove }: TradeWantsStepProps) => {
  const [customLabel, setCustomLabel] = useState('');

  const hasOpenToOffers = tradeWants.some((w) => w.type === 'open_to_offers');
  const hasCash = tradeWants.some((w) => w.type === 'cash');

  const handleQuickAdd = (type: (typeof WANT_TYPE_OPTIONS)[number]['type']) => {
    switch (type) {
      case 'open_to_offers':
        if (!hasOpenToOffers) {
          onAdd({ type: 'open_to_offers' });
        }
        break;
      case 'cash':
        if (!hasCash) {
          onAdd({ type: 'cash', min_amount: null });
        }
        break;
      case 'sealed':
        onAdd({ type: 'sealed', product_type: null });
        break;
      case 'slab':
        onAdd({ type: 'slab', grading_company: null, min_grade: null });
        break;
      case 'raw_cards':
        onAdd({ type: 'raw_cards', min_condition: null });
        break;
      case 'custom':
        // Handled by custom input below
        break;
    }
  };

  const handleAddCustom = () => {
    const trimmed = customLabel.trim();
    if (trimmed.length === 0 || trimmed.length > 50) return;
    onAdd({ type: 'custom', label: trimmed });
    setCustomLabel('');
  };

  const getWantLabel = (want: TradeWant): string => {
    switch (want.type) {
      case 'specific_card':
        return want.card_name;
      case 'sealed':
        return want.product_type ? `Sealed: ${want.product_type}` : 'Any Sealed Product';
      case 'slab':
        return want.grading_company ? `Slab: ${want.grading_company.toUpperCase()}` : 'Any Graded Slab';
      case 'raw_cards':
        return want.min_condition ? `Raw Cards (${want.min_condition}+)` : 'Raw Cards';
      case 'cash':
        return want.min_amount ? `Cash ($${want.min_amount}+)` : 'Cash';
      case 'open_to_offers':
        return 'Open to Offers';
      case 'custom':
        return want.label;
    }
  };

  return (
    <View className="gap-4">
      <Text className="text-base text-muted-foreground">
        What are you looking for in a trade? Add one or more to help find matches.
      </Text>

      {/* Quick-pick buttons */}
      <View className="flex-row flex-wrap gap-2">
        {WANT_TYPE_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isDisabled =
            (option.type === 'open_to_offers' && hasOpenToOffers) ||
            (option.type === 'cash' && hasCash) ||
            option.type === 'custom';

          if (option.type === 'custom') return null;

          return (
            <Pressable
              key={option.type}
              onPress={() => handleQuickAdd(option.type)}
              disabled={isDisabled}
              className={`flex-row items-center gap-1.5 rounded-lg border px-3 py-2 ${
                isDisabled
                  ? 'border-border bg-muted opacity-50'
                  : 'border-primary/30 bg-primary/10 active:bg-primary/20'
              }`}
            >
              <Icon size={14} className={isDisabled ? 'text-muted-foreground' : 'text-primary'} />
              <Text
                className={`text-sm font-medium ${
                  isDisabled ? 'text-muted-foreground' : 'text-primary'
                }`}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Custom tag input */}
      <View className="flex-row items-center gap-2">
        <View className="flex-1 flex-row items-center rounded-lg border border-input bg-background px-3 py-2">
          <MessageCircle size={14} className="text-muted-foreground" />
          <TextInput
            value={customLabel}
            onChangeText={setCustomLabel}
            placeholder="Custom tag (e.g. 'Vintage holos')"
            className="ml-2 flex-1 text-sm text-foreground"
            placeholderTextColor="#a1a1aa"
            maxLength={50}
            onSubmitEditing={handleAddCustom}
            returnKeyType="done"
          />
        </View>
        <Button
          size="sm"
          variant="outline"
          onPress={handleAddCustom}
          disabled={customLabel.trim().length === 0}
        >
          <Plus size={16} className="text-foreground" />
        </Button>
      </View>

      {/* Added wants as removable chips */}
      {tradeWants.length > 0 && (
        <View className="gap-2">
          <Text className="text-sm font-medium text-foreground">
            Looking for ({tradeWants.length}):
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {tradeWants.map((want, index) => (
              <View
                key={`want-${index}`}
                className="flex-row items-center gap-1 rounded-full bg-secondary px-3 py-1.5"
              >
                <Text className="text-sm text-secondary-foreground">
                  {getWantLabel(want)}
                </Text>
                <Pressable onPress={() => onRemove(index)} hitSlop={8}>
                  <X size={14} className="text-secondary-foreground" />
                </Pressable>
              </View>
            ))}
          </View>
        </View>
      )}

      {tradeWants.length === 0 && (
        <Text className="text-center text-sm italic text-muted-foreground">
          Tap a button above or add a custom tag to describe what you want.
        </Text>
      )}
    </View>
  );
};

export default TradeWantsStep;
