import React from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { cn } from '@/lib/cn';

export type CashEditorProps = {
  amount: number;
  direction: 'offering' | 'requesting';
  isEditable: boolean;
  onChangeAmount?: (amount: number) => void;
  onChangeDirection?: (direction: 'offering' | 'requesting') => void;
};

/** Editable cash amount with direction toggle. Read-only when not editable. */
const CashEditor = ({
  amount,
  direction,
  isEditable,
  onChangeAmount,
  onChangeDirection,
}: CashEditorProps) => {
  if (!isEditable && amount === 0) return null;

  if (!isEditable) {
    return (
      <View className="items-center rounded-lg bg-accent px-4 py-3">
        <Text className="text-sm font-medium text-foreground">
          {direction === 'offering' ? '+' : '-'} ${amount.toFixed(2)} cash
          {direction === 'requesting' ? ' (requested)' : ''}
        </Text>
      </View>
    );
  }

  return (
    <View className="gap-2 rounded-lg border border-border bg-card px-4 py-3">
      <Text className="text-xs font-semibold uppercase text-muted-foreground">
        Cash
      </Text>

      {/* Amount input */}
      <View className="flex-row items-center gap-2">
        <Text className="text-base font-semibold text-foreground">$</Text>
        <TextInput
          className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-base text-foreground"
          value={amount > 0 ? String(amount) : ''}
          onChangeText={(text) => {
            const parsed = parseFloat(text.replace(/[^0-9.]/g, ''));
            onChangeAmount?.(isNaN(parsed) ? 0 : parsed);
          }}
          keyboardType="decimal-pad"
          placeholder="0.00"
          placeholderTextColor="#9ca3af"
        />
      </View>

      {/* Direction toggle */}
      <View className="flex-row gap-2">
        <Pressable
          onPress={() => onChangeDirection?.('offering')}
          className={cn(
            'flex-1 items-center rounded-lg py-2',
            direction === 'offering'
              ? 'bg-primary'
              : 'border border-border bg-background',
          )}
        >
          <Text
            className={cn(
              'text-sm font-semibold',
              direction === 'offering'
                ? 'text-primary-foreground'
                : 'text-muted-foreground',
            )}
          >
            Offering
          </Text>
        </Pressable>
        <Pressable
          onPress={() => onChangeDirection?.('requesting')}
          className={cn(
            'flex-1 items-center rounded-lg py-2',
            direction === 'requesting'
              ? 'bg-primary'
              : 'border border-border bg-background',
          )}
        >
          <Text
            className={cn(
              'text-sm font-semibold',
              direction === 'requesting'
                ? 'text-primary-foreground'
                : 'text-muted-foreground',
            )}
          >
            Requesting
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

export default CashEditor;
