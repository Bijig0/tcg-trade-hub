import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { DollarSign, RefreshCw } from 'lucide-react-native';
import TradeWantsStep from '../TradeWantsStep/TradeWantsStep';
import BulkPricingStep from '../BulkPricingStep/BulkPricingStep';
import type { TradeWant } from '@tcg-trade-hub/database';
import type { SelectedCard } from '../../schemas';

type WantConfigStepProps = {
  acceptsCash: boolean;
  acceptsTrades: boolean;
  onSetAcceptsCash: (value: boolean) => void;
  onSetAcceptsTrades: (value: boolean) => void;
  // Pricing (shown when acceptsCash is on)
  selectedCards: SelectedCard[];
  onUpdatePrice: (selectionId: string, price: string) => void;
  onSetAllToMarket: () => void;
  // Trade wants (shown when acceptsTrades is on)
  tradeWants: TradeWant[];
  onAddTradeWant: (want: TradeWant) => void;
  onRemoveTradeWant: (index: number) => void;
};

/**
 * Step 2 in the Have/Want listing flow: "What do you want for your cards?"
 *
 * Toggle buttons for Cash and Trades (at least one must be selected).
 * When Cash is on, shows BulkPricingStep inline for per-card pricing.
 * When Trades is on, shows TradeWantsStep inline for trade preferences.
 */
const WantConfigStep = ({
  acceptsCash,
  acceptsTrades,
  onSetAcceptsCash,
  onSetAcceptsTrades,
  selectedCards,
  onUpdatePrice,
  onSetAllToMarket,
  tradeWants,
  onAddTradeWant,
  onRemoveTradeWant,
}: WantConfigStepProps) => {
  const neitherSelected = !acceptsCash && !acceptsTrades;

  return (
    <View className="gap-5">
      <Text className="text-base text-muted-foreground">
        What do you want for your cards?
      </Text>

      {/* Toggle buttons */}
      <View className="gap-3">
        <Pressable
          onPress={() => onSetAcceptsCash(!acceptsCash)}
          className={`flex-row items-center gap-3 rounded-xl border p-4 ${
            acceptsCash
              ? 'border-green-500 bg-green-500/10'
              : 'border-border bg-card'
          }`}
        >
          <View
            className={`h-10 w-10 items-center justify-center rounded-full ${
              acceptsCash ? 'bg-green-500/20' : 'bg-muted'
            }`}
          >
            <DollarSign
              size={20}
              className={acceptsCash ? 'text-green-500' : 'text-muted-foreground'}
            />
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold text-foreground">Cash</Text>
            <Text className="text-sm text-muted-foreground">
              Set asking prices per card
            </Text>
          </View>
          <View
            className={`h-6 w-6 items-center justify-center rounded-full border-2 ${
              acceptsCash ? 'border-green-500 bg-green-500' : 'border-muted-foreground'
            }`}
          >
            {acceptsCash && (
              <Text className="text-xs font-bold text-white">✓</Text>
            )}
          </View>
        </Pressable>

        <Pressable
          onPress={() => onSetAcceptsTrades(!acceptsTrades)}
          className={`flex-row items-center gap-3 rounded-xl border p-4 ${
            acceptsTrades
              ? 'border-amber-500 bg-amber-500/10'
              : 'border-border bg-card'
          }`}
        >
          <View
            className={`h-10 w-10 items-center justify-center rounded-full ${
              acceptsTrades ? 'bg-amber-500/20' : 'bg-muted'
            }`}
          >
            <RefreshCw
              size={20}
              className={acceptsTrades ? 'text-amber-500' : 'text-muted-foreground'}
            />
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold text-foreground">Trades</Text>
            <Text className="text-sm text-muted-foreground">
              Specify what you're looking for in trade
            </Text>
          </View>
          <View
            className={`h-6 w-6 items-center justify-center rounded-full border-2 ${
              acceptsTrades ? 'border-amber-500 bg-amber-500' : 'border-muted-foreground'
            }`}
          >
            {acceptsTrades && (
              <Text className="text-xs font-bold text-white">✓</Text>
            )}
          </View>
        </Pressable>
      </View>

      {neitherSelected && (
        <Text className="text-center text-sm text-destructive">
          Select at least one option to continue
        </Text>
      )}

      {/* Inline pricing when Cash is toggled on */}
      {acceptsCash && (
        <View className="gap-2">
          <View className="h-px bg-border" />
          <BulkPricingStep
            selectedCards={selectedCards}
            onUpdatePrice={onUpdatePrice}
            onSetAllToMarket={onSetAllToMarket}
          />
        </View>
      )}

      {/* Inline trade wants when Trades is toggled on */}
      {acceptsTrades && (
        <View className="gap-2">
          <View className="h-px bg-border" />
          <TradeWantsStep
            tradeWants={tradeWants}
            onAdd={onAddTradeWant}
            onRemove={onRemoveTradeWant}
          />
        </View>
      )}
    </View>
  );
};

export default WantConfigStep;
