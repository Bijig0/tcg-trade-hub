import React, { useState } from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import { Banknote, Check, Plus, Star, X } from 'lucide-react-native';
import Avatar from '@/components/ui/Avatar/Avatar';
import TradeItemRow from '../TradeItemRow/TradeItemRow';
import type { TradeContextItem, TradeUserProfile } from '../../hooks/useTradeContext/useTradeContext';

export type TradeSideSectionProps = {
  label: string;
  items: TradeContextItem[];
  totalValue: number;
  variant: 'my' | 'their';
  cashAmount?: number;
  isEditable?: boolean;
  onPress?: () => void;
  onClear?: () => void;
  onRemoveItem?: (index: number) => void;
  onChangeCash?: (amount: number) => void;
  userProfile?: TradeUserProfile | null;
};

const VARIANT_STYLES = {
  my: {
    border: 'border-primary/40',
    headerBg: 'bg-primary/5',
    accentColor: '#3b82f6',
    totalBg: 'bg-primary/10',
    totalText: 'text-primary',
    dotColor: 'bg-primary',
    cashBg: 'bg-primary/5',
    cashBorder: 'border-primary/20',
    cashAccent: '#3b82f6',
  },
  their: {
    border: 'border-amber-500/40',
    headerBg: 'bg-amber-500/5',
    accentColor: '#f59e0b',
    totalBg: 'bg-amber-500/10',
    totalText: 'text-amber-600',
    dotColor: 'bg-amber-500',
    cashBg: 'bg-amber-500/5',
    cashBorder: 'border-amber-500/20',
    cashAccent: '#f59e0b',
  },
} as const;

/** Card container showing one side of a trade — color-coded, with user info, items, cash, and total */
const TradeSideSection = ({
  label,
  items,
  totalValue,
  variant,
  cashAmount = 0,
  isEditable,
  onPress,
  onClear,
  onRemoveItem,
  onChangeCash,
  userProfile,
}: TradeSideSectionProps) => {
  const styles = VARIANT_STYLES[variant];
  const [showCashInput, setShowCashInput] = useState(false);
  const cardsValue = items.reduce((s, i) => s + (i.marketPrice ?? 0) * i.quantity, 0);
  const combinedTotal = cardsValue + cashAmount;

  const content = (
    <View className={`overflow-hidden rounded-2xl border-2 ${styles.border} bg-card`}>
      {/* Header — colored band with user info */}
      <View className={`${styles.headerBg} px-4 py-3`}>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2.5">
            <View className={`h-2.5 w-2.5 rounded-full ${styles.dotColor}`} />
            <Text className="text-sm font-bold uppercase tracking-wide text-foreground">
              {label}
            </Text>
          </View>
          {isEditable && (
            <View className="flex-row items-center gap-2">
              {onClear && items.length > 0 && (
                <Pressable
                  onPress={onClear}
                  className="flex-row items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-1 active:opacity-70"
                  hitSlop={4}
                >
                  <X size={12} color="#ef4444" />
                  <Text className="text-xs font-medium text-destructive">Clear</Text>
                </Pressable>
              )}
            </View>
          )}
        </View>
        {/* User info */}
        {userProfile && (
          <View className="mt-2 flex-row items-center gap-2">
            <Avatar
              uri={userProfile.avatarUrl}
              fallback={userProfile.displayName.slice(0, 2).toUpperCase()}
              size="sm"
            />
            <Text className="text-sm font-medium text-foreground">
              {userProfile.displayName}
            </Text>
            <View className="flex-row items-center gap-1">
              <Star size={10} color="#eab308" fill="#eab308" />
              <Text className="text-xs text-muted-foreground">
                {userProfile.ratingScore.toFixed(1)}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Card items */}
      <View className="px-4 py-2">
        {items.length === 0 ? (
          <View className="items-center py-4">
            <Text className="text-sm text-muted-foreground">
              {isEditable ? 'Tap below to add cards' : 'No cards'}
            </Text>
          </View>
        ) : (
          items.map((item, i) => (
            <TradeItemRow
              key={i}
              item={item}
              onRemove={isEditable && onRemoveItem ? () => onRemoveItem(i) : undefined}
            />
          ))
        )}
      </View>

      {/* Add cards button (editable mode) */}
      {isEditable && onPress && (
        <Pressable
          onPress={onPress}
          className="mx-4 mb-3 flex-row items-center justify-center gap-1.5 rounded-lg border border-dashed border-muted-foreground/30 py-2.5 active:opacity-70"
        >
          <Plus size={14} color="#9ca3af" />
          <Text className="text-sm font-medium text-muted-foreground">
            {items.length > 0 ? 'Edit Cards' : 'Add Cards'}
          </Text>
        </Pressable>
      )}

      {/* Cash section — editable: collapsed / active input / confirmed pill — read-only: static or hidden */}
      {isEditable && onChangeCash ? (
        showCashInput ? (
          /* Active input state */
          <View className={`mx-4 mb-3 rounded-lg border ${styles.cashBorder} ${styles.cashBg} px-3 py-2.5`}>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Banknote size={16} color={styles.cashAccent} />
                <Text className="text-xs font-semibold uppercase text-muted-foreground">
                  Cash
                </Text>
              </View>
              <View className="flex-row items-center gap-1">
                {cashAmount > 0 && (
                  <Pressable
                    onPress={() => setShowCashInput(false)}
                    className="rounded-full bg-green-500/15 p-1.5 active:opacity-70"
                    hitSlop={6}
                  >
                    <Check size={14} color="#22c55e" />
                  </Pressable>
                )}
                <Pressable
                  onPress={() => {
                    onChangeCash(0);
                    setShowCashInput(false);
                  }}
                  className="rounded-full p-1.5 active:opacity-70"
                  hitSlop={6}
                >
                  <X size={14} color="#9ca3af" />
                </Pressable>
              </View>
            </View>
            <View className="mt-2 flex-row items-center border-b border-muted-foreground/30 pb-1.5">
              <Text className="text-lg font-bold text-foreground">$</Text>
              <TextInput
                className="ml-1 flex-1 text-lg font-semibold text-foreground"
                value={cashAmount > 0 ? String(cashAmount) : ''}
                onChangeText={(text) => {
                  const parsed = parseFloat(text.replace(/[^0-9.]/g, ''));
                  onChangeCash(isNaN(parsed) ? 0 : parsed);
                }}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor="#9ca3af"
                autoFocus
              />
            </View>
          </View>
        ) : cashAmount > 0 ? (
          /* Confirmed pill — tap to re-edit, X to remove */
          <View className={`mx-4 mb-3 flex-row items-center justify-between rounded-lg border ${styles.cashBorder} ${styles.cashBg} px-3 py-2.5`}>
            <Pressable
              onPress={() => setShowCashInput(true)}
              className="flex-1 flex-row items-center gap-2 active:opacity-70"
            >
              <Banknote size={16} color={styles.cashAccent} />
              <Text className="text-sm font-medium text-foreground">
                ${cashAmount.toFixed(2)} cash
              </Text>
            </Pressable>
            <Pressable
              onPress={() => {
                onChangeCash(0);
                setShowCashInput(false);
              }}
              className="rounded-full p-1 active:opacity-70"
              hitSlop={6}
            >
              <X size={14} color="#9ca3af" />
            </Pressable>
          </View>
        ) : (
          /* Collapsed — "+ Add Cash" button */
          <Pressable
            onPress={() => setShowCashInput(true)}
            className="mx-4 mb-3 flex-row items-center justify-center gap-1.5 rounded-lg border border-dashed border-muted-foreground/30 py-2.5 active:opacity-70"
          >
            <Banknote size={14} color="#9ca3af" />
            <Text className="text-sm font-medium text-muted-foreground">Add Cash</Text>
          </Pressable>
        )
      ) : cashAmount > 0 ? (
        /* Read-only static display */
        <View className={`mx-4 mb-3 flex-row items-center gap-2 rounded-lg ${styles.cashBg} px-3 py-2.5`}>
          <Banknote size={16} color={styles.cashAccent} />
          <Text className="text-sm font-medium text-foreground">
            + ${cashAmount.toFixed(2)} cash
          </Text>
        </View>
      ) : null}

      {/* Total value — prominent */}
      <View className={`${styles.totalBg} px-4 py-3`}>
        <View className="flex-row items-center justify-between">
          <Text className="text-xs font-semibold uppercase text-muted-foreground">
            Total Value
          </Text>
          <Text className={`text-lg font-bold ${styles.totalText}`}>
            ${combinedTotal.toFixed(2)}
          </Text>
        </View>
        <Text className="text-xs text-muted-foreground">
          {items.length} {items.length === 1 ? 'card' : 'cards'}
          {cashAmount > 0 ? ` + $${cashAmount.toFixed(2)} cash` : ''}
        </Text>
      </View>
    </View>
  );

  // When not editable, the whole card is pressable (for viewing details)
  if (onPress && !isEditable) {
    return (
      <Pressable onPress={onPress} className="active:opacity-80">
        {content}
      </Pressable>
    );
  }

  return content;
};

export default TradeSideSection;
