import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { X } from 'lucide-react-native';
import { cn } from '@/lib/cn';
import CardSearchInput from '../CardSearchInput/CardSearchInput';
import calculateTradeBalance from '../../utils/calculateTradeBalance/calculateTradeBalance';
import type { NormalizedCard } from '@tcg-trade-hub/database';
import type { SelectedCard, WantedCard } from '../../schemas';

const FAIRNESS_COLORS = {
  fair: 'bg-green-500/10 border-green-500/30',
  slight_imbalance: 'bg-yellow-500/10 border-yellow-500/30',
  imbalanced: 'bg-red-500/10 border-red-500/30',
} as const;

const FAIRNESS_TEXT_COLORS = {
  fair: 'text-green-600',
  slight_imbalance: 'text-yellow-600',
  imbalanced: 'text-red-600',
} as const;

type WantedCardPickerProps = {
  selectedCards: SelectedCard[];
  wantedCards: WantedCard[];
  onAddWanted: (card: NormalizedCard) => void;
  onRemoveWanted: (externalId: string) => void;
};

/**
 * Step 3 for WTT — search and add cards you want in trade.
 *
 * Shows a search input to add wanted cards, a chip/pill list of already-added
 * cards, and a value comparison bar showing trade fairness.
 */
const WantedCardPicker = ({
  selectedCards,
  wantedCards,
  onAddWanted,
  onRemoveWanted,
}: WantedCardPickerProps) => {
  const balance = calculateTradeBalance(selectedCards, wantedCards);

  return (
    <View className="gap-4">
      <Text className="text-base text-muted-foreground">
        Search for cards you want in return.
      </Text>

      <CardSearchInput tcg={null} onSelect={onAddWanted} />

      {/* Wanted cards chip list */}
      {wantedCards.length > 0 && (
        <View className="gap-2">
          <Text className="text-sm font-medium text-foreground">
            Wanted cards ({wantedCards.length})
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {wantedCards.map((wc) => (
              <View
                key={wc.card.externalId}
                className="flex-row items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5"
              >
                <Text className="text-sm text-foreground" numberOfLines={1}>
                  {wc.card.name}
                </Text>
                {wc.card.marketPrice != null && (
                  <Text className="text-xs text-muted-foreground">
                    ${wc.card.marketPrice.toFixed(2)}
                  </Text>
                )}
                <Pressable
                  onPress={() => onRemoveWanted(wc.card.externalId)}
                  hitSlop={8}
                >
                  <X size={14} className="text-muted-foreground" />
                </Pressable>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Value comparison bar */}
      {selectedCards.length > 0 && wantedCards.length > 0 && (
        <View
          className={cn(
            'rounded-xl border p-3',
            FAIRNESS_COLORS[balance.fairness],
          )}
        >
          <View className="flex-row items-center justify-between">
            <View className="items-center">
              <Text className="text-xs text-muted-foreground">Your cards</Text>
              <Text className="text-base font-semibold text-foreground">
                ${balance.offerTotal.toFixed(2)}
              </Text>
            </View>
            <Text className="text-lg text-muted-foreground">&larr; &rarr;</Text>
            <View className="items-center">
              <Text className="text-xs text-muted-foreground">Wanted</Text>
              <Text className="text-base font-semibold text-foreground">
                ${balance.wantTotal.toFixed(2)}
              </Text>
            </View>
          </View>
          <Text className={cn('mt-1 text-center text-xs font-medium', FAIRNESS_TEXT_COLORS[balance.fairness])}>
            {balance.fairness === 'fair'
              ? 'Fair trade'
              : balance.fairness === 'slight_imbalance'
                ? 'Slight imbalance'
                : 'Imbalanced trade'}
            {' '}({balance.differencePercent.toFixed(0)}% difference)
          </Text>
        </View>
      )}
    </View>
  );
};

export default WantedCardPicker;
