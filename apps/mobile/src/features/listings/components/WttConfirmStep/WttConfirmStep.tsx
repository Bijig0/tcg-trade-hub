import React from 'react';
import { View, Text, Image } from 'react-native';
import { ArrowLeftRight } from 'lucide-react-native';
import { cn } from '@/lib/cn';
import Badge from '@/components/ui/Badge/Badge';
import calculateTradeBalance from '../../utils/calculateTradeBalance/calculateTradeBalance';
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

type WttConfirmStepProps = {
  selectedCards: SelectedCard[];
  wantedCards: WantedCard[];
};

/**
 * Step 4 for WTT — trade confirmation visual.
 *
 * Shows offered cards on the left, an ArrowLeftRight icon in the center,
 * and wanted cards on the right. Includes a value comparison bar.
 */
const WttConfirmStep = ({ selectedCards, wantedCards }: WttConfirmStepProps) => {
  const balance = calculateTradeBalance(selectedCards, wantedCards);

  return (
    <View className="gap-4">
      <Text className="text-base font-medium text-foreground">
        Review your trade
      </Text>

      {/* Trade visual: Your cards ← → Wanted cards */}
      <View className="flex-row items-start gap-2">
        {/* Left: Your offered cards */}
        <View className="flex-1 gap-2">
          <Text className="text-center text-xs font-medium text-muted-foreground">
            YOU OFFER
          </Text>
          {selectedCards.map((sc) => (
            <View
              key={sc.card.externalId}
              className="items-center gap-1 rounded-xl border border-border bg-card p-2"
            >
              <Image
                source={{ uri: sc.card.imageUrl }}
                className="h-16 w-11 rounded-lg bg-muted"
                resizeMode="cover"
              />
              <Text className="text-xs font-medium text-foreground" numberOfLines={1}>
                {sc.card.name}
              </Text>
              <Badge variant="outline">{sc.condition.toUpperCase()}</Badge>
              {sc.card.marketPrice != null && (
                <Text className="text-xs text-muted-foreground">
                  ${sc.card.marketPrice.toFixed(2)}
                </Text>
              )}
            </View>
          ))}
        </View>

        {/* Center: Arrow icon */}
        <View className="items-center justify-center pt-8">
          <ArrowLeftRight size={24} className="text-muted-foreground" />
        </View>

        {/* Right: Wanted cards */}
        <View className="flex-1 gap-2">
          <Text className="text-center text-xs font-medium text-muted-foreground">
            YOU WANT
          </Text>
          {wantedCards.map((wc) => (
            <View
              key={wc.card.externalId}
              className="items-center gap-1 rounded-xl border border-border bg-card p-2"
            >
              <Image
                source={{ uri: wc.card.imageUrl }}
                className="h-16 w-11 rounded-lg bg-muted"
                resizeMode="cover"
              />
              <Text className="text-xs font-medium text-foreground" numberOfLines={1}>
                {wc.card.name}
              </Text>
              {wc.card.marketPrice != null && (
                <Text className="text-xs text-muted-foreground">
                  ${wc.card.marketPrice.toFixed(2)}
                </Text>
              )}
            </View>
          ))}
        </View>
      </View>

      {/* Value comparison bar */}
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
          <ArrowLeftRight size={16} className="text-muted-foreground" />
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
    </View>
  );
};

export default WttConfirmStep;
