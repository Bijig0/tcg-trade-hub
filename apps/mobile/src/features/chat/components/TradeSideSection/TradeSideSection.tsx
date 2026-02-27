import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Plus, Star, X } from 'lucide-react-native';
import Avatar from '@/components/ui/Avatar/Avatar';
import TradeItemRow from '../TradeItemRow/TradeItemRow';
import type { TradeContextItem, TradeUserProfile } from '../../hooks/useTradeContext/useTradeContext';

export type TradeSideSectionProps = {
  label: string;
  items: TradeContextItem[];
  totalValue: number;
  variant: 'my' | 'their';
  isEditable?: boolean;
  onPress?: () => void;
  onClear?: () => void;
  onRemoveItem?: (index: number) => void;
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
  },
  their: {
    border: 'border-amber-500/40',
    headerBg: 'bg-amber-500/5',
    accentColor: '#f59e0b',
    totalBg: 'bg-amber-500/10',
    totalText: 'text-amber-600',
    dotColor: 'bg-amber-500',
  },
} as const;

/** Card container showing one side of a trade — color-coded, with user info, items, and total */
const TradeSideSection = ({
  label,
  items,
  totalValue,
  variant,
  isEditable,
  onPress,
  onClear,
  onRemoveItem,
  userProfile,
}: TradeSideSectionProps) => {
  const styles = VARIANT_STYLES[variant];

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

      {/* Total value — prominent */}
      <View className={`${styles.totalBg} px-4 py-3`}>
        <View className="flex-row items-center justify-between">
          <Text className="text-xs font-semibold uppercase text-muted-foreground">
            Total Value
          </Text>
          <Text className={`text-lg font-bold ${styles.totalText}`}>
            ${totalValue.toFixed(2)}
          </Text>
        </View>
        <Text className="text-xs text-muted-foreground">
          {items.length} {items.length === 1 ? 'card' : 'cards'}
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
