import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useAuth } from '@/context/AuthProvider';
import Skeleton from '@/components/ui/Skeleton/Skeleton';
import useTradeContext from '../../hooks/useTradeContext/useTradeContext';
import type { TradeContextItem } from '../../hooks/useTradeContext/useTradeContext';
import useSendMessage from '../../hooks/useSendMessage/useSendMessage';
import useMyCollection from '@/features/collection/hooks/useMyCollection/useMyCollection';
import useUserCollection from '@/features/collection/hooks/useUserCollection/useUserCollection';
import { toCardRef } from '../../utils/toCardRef/toCardRef';
import NegotiationStatusBadge from '../NegotiationStatusBadge/NegotiationStatusBadge';
import TradeSideSection from '../TradeSideSection/TradeSideSection';
import CardPickerModal from '../CardPickerModal/CardPickerModal';
import ValueComparisonBar from '../ValueComparisonBar/ValueComparisonBar';
import TradeActionFooter from '../TradeActionFooter/TradeActionFooter';
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
  const [myCash, setMyCash] = useState(0);
  const [theirCash, setTheirCash] = useState(0);
  const [offerNote, setOfferNote] = useState('');

  const isEditable = tradeContext
    ? EDITABLE_STATUSES.has(tradeContext.negotiationStatus)
    : false;

  const isListingOwner = tradeContext?.listingOwnerId === user?.id;
  const isOfferSender = tradeContext?.offererId === user?.id;

  // Sync cash state from context — map direction-based model to per-side amounts
  useEffect(() => {
    if (!tradeContext) return;
    const amount = tradeContext.offerCashAmount;
    const direction = tradeContext.offerCashDirection;

    if (amount <= 0 || !direction) {
      setMyCash(0);
      setTheirCash(0);
      return;
    }

    // "offering" means the offerer is adding cash to their side
    // "requesting" means the offerer is requesting cash from the listing owner
    if (isOfferSender) {
      setMyCash(direction === 'offering' ? amount : 0);
      setTheirCash(direction === 'requesting' ? amount : 0);
    } else {
      setMyCash(direction === 'requesting' ? amount : 0);
      setTheirCash(direction === 'offering' ? amount : 0);
    }
  }, [tradeContext, isOfferSender]);

  // Derive other user's ID
  const otherUserId = useMemo(() => {
    if (!tradeContext || !user?.id) return null;
    return user.id === tradeContext.listingOwnerId
      ? tradeContext.offererId
      : tradeContext.listingOwnerId;
  }, [tradeContext, user?.id]);

  // Derive profiles for my/their sides
  const myProfile = isListingOwner
    ? tradeContext?.listingOwnerProfile
    : tradeContext?.offererProfile;
  const theirProfile = isListingOwner
    ? tradeContext?.offererProfile
    : tradeContext?.listingOwnerProfile;

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

    if (isListingOwner) {
      return {
        mySide: {
          label: 'My Offer',
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
        label: 'Their Offer',
        items: tradeContext.listingItems,
        totalValue: tradeContext.listingTotalValue,
      },
    };
  }, [tradeContext, isListingOwner]);

  // Display items (merged editing + DB state)
  const displayMyItems = editingMyItems ?? mySide?.items ?? [];
  const displayTheirItems = editingTheirItems ?? theirSide?.items ?? [];
  const displayMyCardsTotal = displayMyItems.reduce(
    (s, i) => s + (i.marketPrice ?? 0) * i.quantity,
    0,
  );
  const displayTheirCardsTotal = displayTheirItems.reduce(
    (s, i) => s + (i.marketPrice ?? 0) * i.quantity,
    0,
  );
  const displayMyTotal = displayMyCardsTotal + myCash;
  const displayTheirTotal = displayTheirCardsTotal + theirCash;

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

  const handleClearMySide = useCallback(() => {
    setEditingMyItems([]);
  }, []);

  const handleClearTheirSide = useCallback(() => {
    setEditingTheirItems([]);
  }, []);

  const handleRemoveMyItem = useCallback(
    (index: number) => {
      const current = editingMyItems ?? mySide?.items ?? [];
      setEditingMyItems(current.filter((_, i) => i !== index));
    },
    [editingMyItems, mySide],
  );

  const handleRemoveTheirItem = useCallback(
    (index: number) => {
      const current = editingTheirItems ?? theirSide?.items ?? [];
      setEditingTheirItems(current.filter((_, i) => i !== index));
    },
    [editingTheirItems, theirSide],
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

    // Derive net cash from per-side amounts
    const netCash = myCash - theirCash;
    const cashFields =
      netCash > 0
        ? { cash_amount: netCash, cash_direction: 'offering' as const }
        : netCash < 0
          ? { cash_amount: Math.abs(netCash), cash_direction: 'requesting' as const }
          : {};

    const payload: CardOfferPayload = {
      offering: myCards,
      requesting: theirCards,
      ...cashFields,
      ...(offerNote.trim() && { note: offerNote.trim() }),
    };

    sendMessage.mutate(
      {
        conversationId,
        type: 'card_offer',
        body: 'Sent a trade offer',
        payload: payload as unknown as CardOfferPayload,
      },
      {
        onSuccess: () => router.back(),
      },
    );
  }, [conversationId, editingMyItems, editingTheirItems, mySide, theirSide, sendMessage, router, myCash, theirCash, offerNote]);

  const handleAccept = useCallback(() => {
    // TODO: Implement accept offer via card_offer_response message
    console.log('TODO: Accept offer');
  }, []);

  const handleDecline = useCallback(() => {
    // TODO: Implement decline offer via card_offer_response message
    console.log('TODO: Decline offer');
  }, []);

  const handleCounter = useCallback(() => {
    // Enable editing mode for counter-offer
    if (mySide) setEditingMyItems([...mySide.items]);
    if (theirSide) setEditingTheirItems([...theirSide.items]);
  }, [mySide, theirSide]);

  const handleProposeMeetup = useCallback(() => {
    // TODO: Implement meetup proposal
    console.log('TODO: Propose meetup');
  }, []);

  const handleAcceptMeetup = useCallback(() => {
    // TODO: Implement accept meetup
    console.log('TODO: Accept meetup');
  }, []);

  const handleDeclineMeetup = useCallback(() => {
    // TODO: Implement decline meetup
    console.log('TODO: Decline meetup');
  }, []);

  const handleCompleteTrade = useCallback(() => {
    // TODO: Implement complete trade
    console.log('TODO: Complete trade');
  }, []);

  // Skeleton loading state
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        {/* Header skeleton */}
        <View className="flex-row items-center gap-2 border-b border-border px-4 py-3">
          <Skeleton className="h-6 w-6 rounded" />
          <Skeleton className="h-5 w-32 rounded" />
          <View className="flex-1" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </View>
        <View className="flex-1 gap-3 px-4 py-4">
          {/* Trade side skeleton */}
          <View className="gap-2 rounded-xl border border-border p-4">
            <View className="flex-row items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <View className="gap-1">
                <Skeleton className="h-3.5 w-24 rounded" />
                <Skeleton className="h-3 w-16 rounded" />
              </View>
            </View>
            <Skeleton className="h-3 w-20 rounded" />
            <Skeleton className="h-14 w-full rounded" />
            <Skeleton className="h-14 w-full rounded" />
          </View>
          {/* Value bar skeleton */}
          <Skeleton className="h-3 w-full rounded-full" />
          {/* Second trade side skeleton */}
          <View className="gap-2 rounded-xl border border-border p-4">
            <View className="flex-row items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <View className="gap-1">
                <Skeleton className="h-3.5 w-24 rounded" />
                <Skeleton className="h-3 w-16 rounded" />
              </View>
            </View>
            <Skeleton className="h-3 w-20 rounded" />
            <Skeleton className="h-14 w-full rounded" />
          </View>
        </View>
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
          variant="my"
          cashAmount={myCash}
          isEditable={isEditable}
          onPress={isEditable ? () => setPickerSide('my') : undefined}
          onClear={isEditable ? handleClearMySide : undefined}
          onRemoveItem={isEditable ? handleRemoveMyItem : undefined}
          onChangeCash={isEditable ? setMyCash : undefined}
          userProfile={myProfile}
        />

        {/* "FOR" trade divider */}
        <View className="flex-row items-center gap-3 py-1">
          <View className="h-px flex-1 bg-border" />
          <View className="rounded-full bg-foreground px-4 py-1.5">
            <Text className="text-xs font-bold uppercase tracking-widest text-background">
              for
            </Text>
          </View>
          <View className="h-px flex-1 bg-border" />
        </View>

        {/* Their side */}
        <TradeSideSection
          label={theirSide.label}
          items={displayTheirItems}
          totalValue={displayTheirTotal}
          variant="their"
          cashAmount={theirCash}
          isEditable={isEditable}
          onPress={isEditable ? () => setPickerSide('their') : undefined}
          onClear={isEditable ? handleClearTheirSide : undefined}
          onRemoveItem={isEditable ? handleRemoveTheirItem : undefined}
          onChangeCash={isEditable ? setTheirCash : undefined}
          userProfile={theirProfile}
        />

        {/* Value comparison bar */}
        <ValueComparisonBar myValue={displayMyTotal} theirValue={displayTheirTotal} />

        {/* Note section */}
        {isEditable ? (
          <View className="gap-1.5">
            <Text className="text-xs font-semibold uppercase text-muted-foreground">
              Note
            </Text>
            <TextInput
              className="min-h-[60px] rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground"
              value={offerNote}
              onChangeText={setOfferNote}
              placeholder="Add a note to your offer..."
              placeholderTextColor="#9ca3af"
              multiline
              textAlignVertical="top"
              maxLength={500}
            />
          </View>
        ) : offerNote.trim() ? (
          <View className="rounded-lg bg-accent px-4 py-3">
            <Text className="text-xs font-semibold uppercase text-muted-foreground">
              Note
            </Text>
            <Text className="mt-1 text-sm italic text-foreground">
              "{offerNote}"
            </Text>
          </View>
        ) : null}
      </ScrollView>

      {/* Status-based action footer */}
      <TradeActionFooter
        status={tradeContext.negotiationStatus}
        isOfferSender={isOfferSender}
        isPending={sendMessage.isPending}
        hasChanges={hasChanges}
        onPropose={handlePropose}
        onAccept={handleAccept}
        onDecline={handleDecline}
        onCounter={handleCounter}
        onProposeMeetup={handleProposeMeetup}
        onAcceptMeetup={handleAcceptMeetup}
        onDeclineMeetup={handleDeclineMeetup}
        onCompleteTrade={handleCompleteTrade}
      />

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
