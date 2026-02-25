import React, { useMemo, forwardRef, useCallback } from 'react';
import { View, Text, Image, ActivityIndicator } from 'react-native';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Zap } from 'lucide-react-native';
import Button from '@/components/ui/Button/Button';
import Badge from '@/components/ui/Badge/Badge';
import BundlePreview from '../BundlePreview/BundlePreview';
import useMyCollection from '@/features/collection/hooks/useMyCollection/useMyCollection';
import useCreateOffer from '../../hooks/useCreateOffer/useCreateOffer';
import findMatchingCollectionCards from '../../utils/findMatchingCollectionCards/findMatchingCollectionCards';
import { CONDITION_LABELS } from '@/config/constants';
import type { TradeOpportunity } from '../../schemas';
import type { NormalizedCard, TradeWant } from '@tcg-trade-hub/database';

type MatchConfirmSheetProps = {
  opportunity: TradeOpportunity | null;
  myListingId: string;
  theirTradeWants: TradeWant[];
  onClose: () => void;
  onSuccess: () => void;
};

/**
 * Bottom sheet that confirms a quick match by auto-selecting cards
 * from the user's collection that satisfy the other party's trade wants.
 */
const MatchConfirmSheet = forwardRef<BottomSheet, MatchConfirmSheetProps>(
  ({ opportunity, myListingId, theirTradeWants, onClose, onSuccess }, ref) => {
    const snapPoints = useMemo(() => ['70%', '92%'], []);
    const { data: myCollection } = useMyCollection();
    const createOffer = useCreateOffer();

    const matchedCards = useMemo(() => {
      if (!myCollection || theirTradeWants.length === 0) return [];
      const tradeable = myCollection.filter((c) => c.is_tradeable && !c.is_wishlist);
      return findMatchingCollectionCards(theirTradeWants, tradeable);
    }, [myCollection, theirTradeWants]);

    const yourSideValue = matchedCards.reduce(
      (sum, c) => sum + (c.market_price ?? 0),
      0,
    );

    const theirSideValue = opportunity
      ? opportunity.listing.items.reduce((sum, i) => sum + (i.market_price ?? 0), 0) +
        opportunity.listing.cash_amount
      : 0;

    const valueDiff = theirSideValue - yourSideValue;

    const handleSendMatch = useCallback(() => {
      if (!opportunity) return;

      const selectedCards = matchedCards.map((c) => ({
        card: {
          externalId: c.external_id,
          tcg: c.tcg,
          name: c.card_name,
          setName: c.set_name,
          setCode: c.set_code,
          number: c.card_number,
          imageUrl: c.image_url,
          marketPrice: c.market_price,
          rarity: c.rarity ?? '',
        } as NormalizedCard,
        condition: c.condition,
        fromCollection: true,
        addToCollection: false,
        askingPrice: '',
      }));

      createOffer.mutate(
        {
          listingId: opportunity.listing.id,
          selectedCards,
          cashAmount: 0,
          message: `Quick match from listing ${myListingId}`,
        },
        {
          onSuccess: () => {
            onSuccess();
          },
        },
      );
    }, [opportunity, matchedCards, myListingId, createOffer, onSuccess]);

    if (!opportunity) return null;

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        onClose={onClose}
        backgroundStyle={{ borderRadius: 20, backgroundColor: '#0f0f13' }}
        handleIndicatorStyle={{ backgroundColor: '#a1a1aa', width: 40 }}
      >
        <BottomSheetScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          <View className="px-4 pt-2">
            <View className="flex-row items-center gap-2">
              <Zap size={20} color="#f59e0b" />
              <Text className="text-lg font-bold text-foreground">Quick Match</Text>
            </View>
            <Text className="mt-1 text-sm text-muted-foreground">
              Send an offer with auto-selected cards from your collection.
            </Text>
          </View>

          {/* Their listing */}
          <View className="mx-4 mt-4 rounded-xl border border-border bg-card p-3">
            <Text className="mb-2 text-xs font-medium text-muted-foreground">
              They&apos;re offering:
            </Text>
            <BundlePreview items={opportunity.listing.items} size="md" />
            <Text className="mt-2 text-sm font-semibold text-card-foreground">
              {opportunity.listing.title}
            </Text>
            <Text className="text-xs text-muted-foreground">
              Value: ${theirSideValue.toFixed(2)}
            </Text>
          </View>

          {/* Your auto-selected cards */}
          <View className="mx-4 mt-4 rounded-xl border border-border bg-card p-3">
            <Text className="mb-2 text-xs font-medium text-muted-foreground">
              Your matching cards ({matchedCards.length}):
            </Text>
            {matchedCards.length > 0 ? (
              <View className="gap-2">
                {matchedCards.slice(0, 5).map((card) => (
                  <View key={card.id} className="flex-row items-center gap-2">
                    {card.image_url ? (
                      <Image
                        source={{ uri: card.image_url }}
                        className="h-10 w-8 rounded"
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="h-10 w-8 items-center justify-center rounded bg-muted">
                        <Text className="text-[8px] text-muted-foreground">?</Text>
                      </View>
                    )}
                    <View className="flex-1">
                      <Text className="text-sm text-foreground" numberOfLines={1}>
                        {card.card_name}
                      </Text>
                      <Badge variant="secondary">{CONDITION_LABELS[card.condition]}</Badge>
                    </View>
                    <Text className="text-xs text-muted-foreground">
                      {card.market_price != null ? `$${card.market_price.toFixed(2)}` : '—'}
                    </Text>
                  </View>
                ))}
                {matchedCards.length > 5 && (
                  <Text className="text-xs text-muted-foreground">
                    +{matchedCards.length - 5} more
                  </Text>
                )}
              </View>
            ) : (
              <Text className="text-sm italic text-muted-foreground">
                No matching cards found in your collection.
              </Text>
            )}
            <Text className="mt-2 text-xs text-muted-foreground">
              Your side: ${yourSideValue.toFixed(2)}
            </Text>
          </View>

          {/* Value comparison */}
          <View className="mx-4 mt-3 rounded-lg bg-muted p-3">
            <Text className="text-center text-sm font-medium text-foreground">
              {valueDiff > 0
                ? `+$${valueDiff.toFixed(2)} in your favor`
                : valueDiff < 0
                  ? `-$${Math.abs(valueDiff).toFixed(2)} against you`
                  : 'Even trade'}
            </Text>
          </View>

          {/* Send button */}
          <View className="mx-4 mt-4">
            <Button
              size="lg"
              onPress={handleSendMatch}
              disabled={matchedCards.length === 0 || createOffer.isPending}
              className="w-full"
            >
              {createOffer.isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <View className="flex-row items-center gap-2">
                  <Zap size={16} color="white" />
                  <Text className="text-base font-semibold text-primary-foreground">
                    Send Match
                  </Text>
                </View>
              )}
            </Button>
          </View>
        </BottomSheetScrollView>
      </BottomSheet>
    );
  },
);

MatchConfirmSheet.displayName = 'MatchConfirmSheet';

export default MatchConfirmSheet;
