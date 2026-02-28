import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { ChevronDown } from 'lucide-react-native';
import Badge from '@/components/ui/Badge/Badge';
import ListingTypeBadge from '../ListingTypeBadge/ListingTypeBadge';
import type { SelectedCard } from '../../schemas';
import type { ListingType, TradeWant } from '@tcg-trade-hub/database';

type BundleConfirmStepProps = {
  effectiveType: ListingType;
  acceptsCash: boolean;
  acceptsTrades: boolean;
  selectedCards: SelectedCard[];
  cashAmount: string;
  description: string | null;
  tradeWants: TradeWant[];
  typeOverride: ListingType | null;
  onTypeOverride: (type: ListingType | null) => void;
};

const CASH_LABELS: Record<ListingType, string> = {
  wts: 'Asking Price',
  wtb: 'Budget',
  wtt: 'Cash Sweetener',
};

const TYPE_OPTIONS: { value: ListingType; label: string }[] = [
  { value: 'wts', label: 'Want to Sell' },
  { value: 'wtb', label: 'Want to Buy' },
  { value: 'wtt', label: 'Want to Trade' },
];

/**
 * Review step with auto-derived Have/Want badges and manual type override.
 */
const BundleConfirmStep = ({
  effectiveType,
  acceptsCash,
  acceptsTrades,
  selectedCards,
  cashAmount,
  description,
  tradeWants,
  typeOverride,
  onTypeOverride,
}: BundleConfirmStepProps) => {
  const [showOverridePicker, setShowOverridePicker] = useState(false);

  const totalItemValue = selectedCards.reduce((sum, sc) => {
    const price = acceptsCash && sc.askingPrice
      ? parseFloat(sc.askingPrice)
      : (sc.card.marketPrice ?? 0);
    return sum + (isNaN(price) ? 0 : price);
  }, 0);

  const cash = parseFloat(cashAmount) || 0;
  const totalValue = totalItemValue + cash;

  const getWantLabel = (want: TradeWant): string => {
    switch (want.type) {
      case 'specific_card': return want.card_name;
      case 'sealed': return want.product_type ? `Sealed: ${want.product_type}` : 'Any Sealed';
      case 'slab': return want.grading_company ? `Slab: ${want.grading_company.toUpperCase()}` : 'Any Slab';
      case 'raw_cards': return want.min_condition ? `Raw (${want.min_condition}+)` : 'Raw Cards';
      case 'cash': return want.min_amount ? `Cash ($${want.min_amount}+)` : 'Cash';
      case 'open_to_offers': return 'Open to Offers';
      case 'custom': return want.label;
    }
  };

  return (
    <View className="gap-4">
      <View>
        <Text className="text-base font-medium text-foreground">
          Review your listing
        </Text>
        <Text className="mt-1 text-sm text-muted-foreground">
          {selectedCards.length} card{selectedCards.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Auto-derived badges + override */}
      <View className="flex-row items-center gap-2">
        {acceptsCash && <ListingTypeBadge type="wts" />}
        {acceptsTrades && <ListingTypeBadge type="wtt" />}
        <Pressable
          onPress={() => setShowOverridePicker(!showOverridePicker)}
          className="ml-auto flex-row items-center gap-1 rounded-lg border border-border px-2 py-1"
        >
          <Text className="text-xs text-muted-foreground">
            {typeOverride ? 'Overridden' : 'Change label'}
          </Text>
          <ChevronDown size={12} className="text-muted-foreground" />
        </Pressable>
      </View>

      {showOverridePicker && (
        <View className="gap-1 rounded-xl border border-border bg-card p-2">
          <Pressable
            onPress={() => {
              onTypeOverride(null);
              setShowOverridePicker(false);
            }}
            className={`rounded-lg px-3 py-2 ${!typeOverride ? 'bg-primary/10' : ''}`}
          >
            <Text className={`text-sm ${!typeOverride ? 'font-medium text-primary' : 'text-foreground'}`}>
              Auto ({effectiveType.toUpperCase()})
            </Text>
          </Pressable>
          {TYPE_OPTIONS.map((opt) => (
            <Pressable
              key={opt.value}
              onPress={() => {
                onTypeOverride(opt.value);
                setShowOverridePicker(false);
              }}
              className={`rounded-lg px-3 py-2 ${typeOverride === opt.value ? 'bg-primary/10' : ''}`}
            >
              <Text className={`text-sm ${typeOverride === opt.value ? 'font-medium text-primary' : 'text-foreground'}`}>
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* Accepts summary */}
      <View className="flex-row items-center gap-2">
        <Text className="text-sm text-muted-foreground">Accepts:</Text>
        {acceptsCash && (
          <Badge variant="outline">Cash</Badge>
        )}
        {acceptsTrades && (
          <Badge variant="outline">Trades</Badge>
        )}
      </View>

      {/* Trade wants */}
      {tradeWants.length > 0 && (
        <View className="gap-1">
          <Text className="text-sm font-medium text-muted-foreground">
            Looking for:
          </Text>
          <View className="flex-row flex-wrap gap-1.5">
            {tradeWants.map((want, i) => (
              <Badge key={`tw-${i}`} variant="secondary">
                {getWantLabel(want)}
              </Badge>
            ))}
          </View>
        </View>
      )}

      {/* Card grid */}
      {selectedCards.map((sc) => (
        <View
          key={sc.selectionId}
          className="flex-row items-center gap-3 rounded-xl border border-border bg-card p-3"
        >
          <Image
            source={{ uri: sc.card.imageUrl }}
            className="h-20 w-14 rounded-lg bg-muted"
            contentFit="cover"
            cachePolicy="disk"
            transition={150}
          />
          <View className="flex-1 gap-1">
            <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
              {sc.card.name}
            </Text>
            <Text className="text-xs text-muted-foreground" numberOfLines={1}>
              {sc.card.setName}
            </Text>
            <Badge variant="outline">{sc.condition.toUpperCase()}</Badge>
            {acceptsCash && sc.askingPrice ? (
              <Text className="mt-0.5 text-base font-semibold text-foreground">
                ${parseFloat(sc.askingPrice).toFixed(2)}
              </Text>
            ) : sc.card.marketPrice != null ? (
              <Text className="mt-0.5 text-sm text-muted-foreground">
                Mkt: ${sc.card.marketPrice.toFixed(2)}
              </Text>
            ) : null}
          </View>
        </View>
      ))}

      {/* Cash amount */}
      {cash > 0 && (
        <View className="flex-row items-center justify-between rounded-xl border border-border bg-card p-3">
          <Text className="text-sm text-muted-foreground">{CASH_LABELS[effectiveType]}</Text>
          <Text className="text-base font-semibold text-foreground">${cash.toFixed(2)}</Text>
        </View>
      )}

      {/* Total value */}
      <View className="flex-row items-center justify-between rounded-xl border border-primary/30 bg-primary/5 p-3">
        <Text className="text-sm font-medium text-foreground">Total Value</Text>
        <Text className="text-lg font-bold text-foreground">${totalValue.toFixed(2)}</Text>
      </View>

      {/* Description */}
      {description ? (
        <View>
          <Text className="mb-1 text-sm font-medium text-muted-foreground">Notes</Text>
          <Text className="text-sm text-foreground">{description}</Text>
        </View>
      ) : null}
    </View>
  );
};

export default BundleConfirmStep;
