import React, { forwardRef, useMemo, useCallback } from 'react';
import { View, Text } from 'react-native';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';
import type { PreviousOffer } from '../../hooks/usePreviousOffer/usePreviousOffer';
import type { TradeContextItem } from '../../hooks/useTradeContext/useTradeContext';
import TradeSideSection from '../TradeSideSection/TradeSideSection';
import ValueComparisonBar from '../ValueComparisonBar/ValueComparisonBar';
import type { CardRef } from '@tcg-trade-hub/database';

type PreviousOfferSheetProps = {
  previousOffer: PreviousOffer;
};

const SNAP_POINTS = ['55%', '85%'];

/** Maps a CardRef from the offer payload to a TradeContextItem for TradeSideSection display */
const cardRefToTradeItem = (ref: CardRef): TradeContextItem => ({
  cardName: ref.name,
  cardImageUrl: ref.imageUrl,
  cardExternalId: ref.externalId,
  tcg: ref.tcg,
  condition: (ref.condition as string) ?? 'nm',
  quantity: ref.quantity ?? 1,
  marketPrice: null,
});

/** Formats a relative time string from an ISO date (e.g. "2h ago", "3d ago") */
const formatRelativeTime = (isoDate: string): string => {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

/**
 * Read-only bottom sheet showing the previous offer snapshot.
 * Displays both sides of the trade with the FOR divider and value comparison bar.
 */
const PreviousOfferSheet = forwardRef<BottomSheet, PreviousOfferSheetProps>(
  ({ previousOffer }, ref) => {
    const router = useRouter();

    const handleCardPress = useCallback(
      (item: TradeContextItem) => {
        router.push({
          pathname: '/(tabs)/(listings)/listing-card-detail',
          params: {
            cardExternalId: item.cardExternalId,
            cardName: item.cardName,
            cardImageUrl: item.cardImageUrl,
            tcg: item.tcg,
            condition: item.condition,
            marketPrice: item.marketPrice != null ? String(item.marketPrice) : '',
          },
        });
      },
      [router],
    );

    const offeringItems = useMemo(
      () => previousOffer.offering.map(cardRefToTradeItem),
      [previousOffer.offering],
    );
    const requestingItems = useMemo(
      () => previousOffer.requesting.map(cardRefToTradeItem),
      [previousOffer.requesting],
    );

    // Determine cash per side
    const offeringCash =
      previousOffer.cashDirection === 'offering' ? previousOffer.cashAmount : 0;
    const requestingCash =
      previousOffer.cashDirection === 'requesting' ? previousOffer.cashAmount : 0;

    const offeringTotal =
      offeringItems.reduce((s, i) => s + (i.marketPrice ?? 0) * i.quantity, 0) +
      offeringCash;
    const requestingTotal =
      requestingItems.reduce((s, i) => s + (i.marketPrice ?? 0) * i.quantity, 0) +
      requestingCash;

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={SNAP_POINTS}
        enablePanDownToClose
        backgroundStyle={{ borderRadius: 20, backgroundColor: '#0f0f13' }}
        handleIndicatorStyle={{ backgroundColor: '#a1a1aa', width: 40 }}
      >
        <BottomSheetScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Header */}
          <View className="flex-row items-center justify-between px-4 pb-3 pt-1">
            <Text className="text-base font-semibold text-foreground">
              Previous Offer
            </Text>
            <Text className="text-xs text-muted-foreground">
              {formatRelativeTime(previousOffer.sentAt)}
            </Text>
          </View>

          <View className="gap-3 px-4">
            {/* Offering side */}
            <TradeSideSection
              label={`${previousOffer.senderDisplayName}'s Side`}
              items={offeringItems}
              totalValue={offeringTotal}
              variant="their"
              cashAmount={offeringCash}
              notes={previousOffer.offeringNotes}
              onCardPress={handleCardPress}
            />

            {/* FOR divider */}
            <View className="flex-row items-center gap-3 py-1">
              <View className="h-px flex-1 bg-border" />
              <View className="rounded-full bg-foreground px-4 py-1.5">
                <Text className="text-xs font-bold uppercase tracking-widest text-background">
                  for
                </Text>
              </View>
              <View className="h-px flex-1 bg-border" />
            </View>

            {/* Requesting side */}
            <TradeSideSection
              label="Requested"
              items={requestingItems}
              totalValue={requestingTotal}
              variant="my"
              cashAmount={requestingCash}
              notes={previousOffer.requestingNotes}
              onCardPress={handleCardPress}
            />

            {/* Value comparison */}
            <ValueComparisonBar
              myValue={requestingTotal}
              theirValue={offeringTotal}
            />
          </View>
        </BottomSheetScrollView>
      </BottomSheet>
    );
  },
);

PreviousOfferSheet.displayName = 'PreviousOfferSheet';

export default PreviousOfferSheet;
