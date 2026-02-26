import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeftRight, ChevronLeft } from 'lucide-react-native';
import { useAuth } from '@/context/AuthProvider';
import Button from '@/components/ui/Button/Button';
import useTradeContext from '../../hooks/useTradeContext/useTradeContext';
import type { TradeContextItem } from '../../hooks/useTradeContext/useTradeContext';
import useSendMessage from '../../hooks/useSendMessage/useSendMessage';
import useMyCollection from '@/features/collection/hooks/useMyCollection/useMyCollection';
import useUserCollection from '@/features/collection/hooks/useUserCollection/useUserCollection';
import { toCardRef } from '../../utils/toCardRef/toCardRef';
import NegotiationStatusBadge from '../NegotiationStatusBadge/NegotiationStatusBadge';
import TradeSideSection from '../TradeSideSection/TradeSideSection';
import CardPickerModal from '../CardPickerModal/CardPickerModal';
import type { CardOfferPayload } from '@tcg-trade-hub/database';

export type OfferDetailScreenProps = {
  conversationId: string;
};

const EDITABLE_STATUSES = new Set(['chatting', 'offer_pending']);

/** Full-screen view showing "My Side" vs "Their Side" of a trade with editing support */
const OfferDetailScreen = ({ conversationId }: OfferDetailScreenProps) => {
  const { user } = useAuth();
  const router = useRouter();
  const { data: tradeContext, isLoading } = useTradeContext(conversationId);
  const sendMessage = useSendMessage();

  // Editing state
  const [editingMyItems, setEditingMyItems] = useState<TradeContextItem[] | null>(null);
  const [editingTheirItems, setEditingTheirItems] = useState<TradeContextItem[] | null>(null);
  const [pickerSide, setPickerSide] = useState<'my' | 'their' | null>(null);

  const isEditable = tradeContext
    ? EDITABLE_STATUSES.has(tradeContext.negotiationStatus)
    : false;

  // Derive other user's ID
  const otherUserId = useMemo(() => {
    if (!tradeContext || !user?.id) return null;
    return user.id === tradeContext.listingOwnerId
      ? tradeContext.offererId
      : tradeContext.listingOwnerId;
  }, [tradeContext, user?.id]);

  // Fetch collections (only when editable)
  const { data: myCollection, isLoading: myCollLoading } = useMyCollection();
  const { data: theirCollection, isLoading: theirCollLoading } = useUserCollection(
    isEditable ? otherUserId : null,
  );

  // Filter collections to tradeable cards
  const myTradeableCards = useMemo(
    () => (myCollection ?? []).filter((c) => c.is_tradeable && !c.is_wishlist),
    [myCollection],
  );

  const theirTradeableCards = useMemo(
    () => (theirCollection ?? []).filter((c) => !c.is_wishlist),
    [theirCollection],
  );

  const { mySide, theirSide } = useMemo(() => {
    if (!tradeContext) return { mySide: null, theirSide: null };

    const isListingOwner = tradeContext.listingOwnerId === user?.id;

    if (isListingOwner) {
      return {
        mySide: {
          label: 'My Listing',
          items: tradeContext.listingItems,
          totalValue: tradeContext.listingTotalValue,
        },
        theirSide: {
          label: 'Their Offer',
          items: tradeContext.offerItems,
          totalValue: tradeContext.offerItems.reduce(
            (sum, item) => sum + (item.marketPrice ?? 0) * item.quantity,
            0,
          ),
        },
      };
    }

    return {
      mySide: {
        label: 'My Offer',
        items: tradeContext.offerItems,
        totalValue: tradeContext.offerItems.reduce(
          (sum, item) => sum + (item.marketPrice ?? 0) * item.quantity,
          0,
        ),
      },
      theirSide: {
        label: 'Their Listing',
        items: tradeContext.listingItems,
        totalValue: tradeContext.listingTotalValue,
      },
    };
  }, [tradeContext, user?.id]);

  // Display items (merged editing + DB state)
  const displayMyItems = editingMyItems ?? mySide?.items ?? [];
  const displayTheirItems = editingTheirItems ?? theirSide?.items ?? [];
  const displayMyTotal = displayMyItems.reduce(
    (s, i) => s + (i.marketPrice ?? 0) * i.quantity,
    0,
  );
  const displayTheirTotal = displayTheirItems.reduce(
    (s, i) => s + (i.marketPrice ?? 0) * i.quantity,
    0,
  );

  const hasChanges = editingMyItems !== null || editingTheirItems !== null;

  // Selected external IDs for pre-selecting in picker
  const mySelectedExternalIds = useMemo(
    () => new Set(displayMyItems.map((i) => i.cardExternalId)),
    [displayMyItems],
  );
  const theirSelectedExternalIds = useMemo(
    () => new Set(displayTheirItems.map((i) => i.cardExternalId)),
    [displayTheirItems],
  );

  const handlePickerConfirm = useCallback(
    (items: TradeContextItem[]) => {
      if (pickerSide === 'my') {
        setEditingMyItems(items);
      } else if (pickerSide === 'their') {
        setEditingTheirItems(items);
      }
      setPickerSide(null);
    },
    [pickerSide],
  );

  const handlePropose = useCallback(() => {
    if (!mySide) return;

    const myCards = (editingMyItems ?? mySide.items).map(toCardRef);
    const theirCards = (editingTheirItems ?? theirSide?.items ?? []).map(toCardRef);

    sendMessage.mutate(
      {
        conversationId,
        type: 'card_offer',
        body: 'Sent a trade offer',
        payload: {
          offering: myCards,
          requesting: theirCards,
        } as unknown as CardOfferPayload,
      },
      {
        onSuccess: () => router.back(),
      },
    );
  }, [conversationId, editingMyItems, editingTheirItems, mySide, theirSide, sendMessage, router]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background" edges={['top']}>
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  if (!tradeContext || !mySide || !theirSide) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background" edges={['top']}>
        <Text className="text-base text-muted-foreground">
          Trade details unavailable
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center gap-2 border-b border-border px-4 py-3">
        <Pressable
          onPress={() => router.back()}
          className="p-1 active:opacity-70"
          hitSlop={8}
        >
          <ChevronLeft size={24} color="#6b7280" />
        </Pressable>
        <Text className="flex-1 text-lg font-semibold text-foreground">
          Trade Details
        </Text>
        <NegotiationStatusBadge status={tradeContext.negotiationStatus} />
      </View>

      {/* Scrollable content */}
      <ScrollView className="flex-1 px-4 py-4" contentContainerClassName="gap-3 pb-8">
        {/* My side */}
        <TradeSideSection
          label={mySide.label}
          items={displayMyItems}
          totalValue={displayMyTotal}
          isEditable={isEditable}
          onPress={isEditable ? () => setPickerSide('my') : undefined}
        />

        {/* Swap icon */}
        <View className="items-center py-1">
          <ArrowLeftRight size={20} color="#9ca3af" />
        </View>

        {/* Their side */}
        <TradeSideSection
          label={theirSide.label}
          items={displayTheirItems}
          totalValue={displayTheirTotal}
          isEditable={isEditable}
          onPress={isEditable ? () => setPickerSide('their') : undefined}
        />

        {/* Cash amount */}
        {tradeContext.offerCashAmount > 0 && (
          <View className="items-center rounded-lg bg-accent px-4 py-3">
            <Text className="text-sm font-medium text-foreground">
              + ${tradeContext.offerCashAmount.toFixed(2)} cash
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Sticky footer — Propose Trade button */}
      {isEditable && (
        <View className="border-t border-border bg-background px-4 pb-6 pt-3">
          <Button
            size="lg"
            onPress={handlePropose}
            disabled={!hasChanges || sendMessage.isPending}
            className="w-full"
          >
            {sendMessage.isPending ? 'Sending...' : 'Propose Trade'}
          </Button>
        </View>
      )}

      {/* Card picker modal */}
      <CardPickerModal
        visible={pickerSide === 'my'}
        onClose={() => setPickerSide(null)}
        collection={myTradeableCards}
        isLoading={myCollLoading}
        selectedExternalIds={mySelectedExternalIds}
        onConfirm={handlePickerConfirm}
        title="Select My Cards"
      />
      <CardPickerModal
        visible={pickerSide === 'their'}
        onClose={() => setPickerSide(null)}
        collection={theirTradeableCards}
        isLoading={theirCollLoading}
        selectedExternalIds={theirSelectedExternalIds}
        onConfirm={handlePickerConfirm}
        title="Select Their Cards"
      />
    </SafeAreaView>
  );
};

export default OfferDetailScreen;
