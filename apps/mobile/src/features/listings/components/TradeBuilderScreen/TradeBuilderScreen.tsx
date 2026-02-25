import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, Pressable, FlatList, ActivityIndicator, Alert } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Check } from 'lucide-react-native';
import Badge from '@/components/ui/Badge/Badge';
import Button from '@/components/ui/Button/Button';
import useListingDetail from '@/features/feed/hooks/useListingDetail/useListingDetail';
import useMyCollection from '@/features/collection/hooks/useMyCollection/useMyCollection';
import useUserCollection from '@/features/collection/hooks/useUserCollection/useUserCollection';
import useCreateOffer from '../../hooks/useCreateOffer/useCreateOffer';
import { CONDITION_LABELS } from '@/config/constants';
import type { CollectionItemRow, NormalizedCard } from '@tcg-trade-hub/database';
import type { SelectedCard } from '../../schemas';

/**
 * Full-screen trade builder that lets users select cards from both sides
 * to construct a custom trade offer.
 */
const TradeBuilderScreen = () => {
  const { theirListingId } = useLocalSearchParams<{
    myListingId: string;
    theirListingId: string;
    mode?: string;
  }>();
  const router = useRouter();

  const { data: theirListing } = useListingDetail(theirListingId ?? '');
  const { data: myCollection } = useMyCollection();

  // Get their user_id from their listing
  const theirUserId = theirListing?.user_id ?? null;
  const { data: theirCollection } = useUserCollection(theirUserId);

  const createOffer = useCreateOffer();

  const [selectedTheirIds, setSelectedTheirIds] = useState<Set<string>>(new Set());
  const [selectedMyIds, setSelectedMyIds] = useState<Set<string>>(new Set());

  // Filter my collection to tradeable, non-wishlist items
  const myTradeableCards = useMemo(
    () => (myCollection ?? []).filter((c) => c.is_tradeable && !c.is_wishlist),
    [myCollection],
  );

  // Filter their collection to tradeable, non-wishlist items
  const theirTradeableCards = useMemo(
    () => (theirCollection ?? []).filter((c) => !c.is_wishlist),
    [theirCollection],
  );

  const toggleTheirCard = useCallback((id: string) => {
    setSelectedTheirIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleMyCard = useCallback((id: string) => {
    setSelectedMyIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const mySelectedCards = useMemo(
    () => myTradeableCards.filter((c) => selectedMyIds.has(c.id)),
    [myTradeableCards, selectedMyIds],
  );

  const theirSelectedCards = useMemo(
    () => theirTradeableCards.filter((c) => selectedTheirIds.has(c.id)),
    [theirTradeableCards, selectedTheirIds],
  );

  const myTotal = mySelectedCards.reduce((sum, c) => sum + (c.market_price ?? 0), 0);
  const theirTotal = theirSelectedCards.reduce((sum, c) => sum + (c.market_price ?? 0), 0);
  const valueDiff = theirTotal - myTotal;

  const handleSendOffer = useCallback(() => {
    if (!theirListingId || mySelectedCards.length === 0) {
      Alert.alert('Error', 'Select at least one card to offer.');
      return;
    }

    const selectedCards: SelectedCard[] = mySelectedCards.map((c) => ({
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
        listingId: theirListingId,
        selectedCards,
        cashAmount: 0,
        message: null,
      },
      {
        onSuccess: () => {
          Alert.alert('Offer Sent', 'Your trade offer has been sent.');
          router.back();
        },
        onError: (err) => {
          Alert.alert('Error', err.message);
        },
      },
    );
  }, [theirListingId, mySelectedCards, createOffer, router]);

  const renderCard = (
    item: CollectionItemRow,
    isSelected: boolean,
    onToggle: (id: string) => void,
  ) => (
    <Pressable
      onPress={() => onToggle(item.id)}
      className={`mb-2 flex-row items-center rounded-xl p-2 ${
        isSelected ? 'border border-primary bg-primary/10' : 'border border-transparent bg-card'
      }`}
    >
      {item.image_url ? (
        <Image source={{ uri: item.image_url }} className="h-14 w-10 rounded" contentFit="cover" cachePolicy="disk" transition={150} />
      ) : (
        <View className="h-14 w-10 items-center justify-center rounded bg-muted">
          <Text className="text-[8px] text-muted-foreground">?</Text>
        </View>
      )}
      <View className="ml-2 flex-1">
        <Text className="text-sm font-medium text-foreground" numberOfLines={1}>
          {item.card_name}
        </Text>
        <View className="flex-row items-center gap-1">
          <Badge variant="secondary">{CONDITION_LABELS[item.condition]}</Badge>
          {item.market_price != null && (
            <Text className="text-xs text-muted-foreground">
              ${item.market_price.toFixed(2)}
            </Text>
          )}
        </View>
      </View>
      {isSelected && (
        <View className="h-5 w-5 items-center justify-center rounded-full bg-primary">
          <Check size={12} color="white" />
        </View>
      )}
    </Pressable>
  );

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center border-b border-border px-4 py-3">
        <Pressable onPress={() => router.back()} className="mr-3 p-1">
          <ArrowLeft size={24} className="text-foreground" />
        </Pressable>
        <Text className="flex-1 text-lg font-semibold text-foreground">
          Trade Builder
        </Text>
      </View>

      <View className="flex-1">
        {/* Their side */}
        <View className="flex-1 border-b border-border">
          <View className="flex-row items-center justify-between px-4 py-2">
            <Text className="text-sm font-semibold text-muted-foreground">
              Their Collection ({theirTradeableCards.length})
            </Text>
            <Text className="text-xs text-muted-foreground">
              Selected: {selectedTheirIds.size}
            </Text>
          </View>
          <FlatList
            data={theirTradeableCards}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) =>
              renderCard(item, selectedTheirIds.has(item.id), toggleTheirCard)
            }
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 8 }}
          />
        </View>

        {/* Your side */}
        <View className="flex-1">
          <View className="flex-row items-center justify-between px-4 py-2">
            <Text className="text-sm font-semibold text-muted-foreground">
              Your Collection ({myTradeableCards.length})
            </Text>
            <Text className="text-xs text-muted-foreground">
              Selected: {selectedMyIds.size}
            </Text>
          </View>
          <FlatList
            data={myTradeableCards}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) =>
              renderCard(item, selectedMyIds.has(item.id), toggleMyCard)
            }
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 8 }}
          />
        </View>
      </View>

      {/* Sticky footer */}
      <View className="border-t border-border bg-background px-4 pb-6 pt-3">
        <View className="mb-2 flex-row items-center justify-between">
          <Text className="text-sm text-muted-foreground">
            You give: ${myTotal.toFixed(2)}
          </Text>
          <Text className="text-sm text-muted-foreground">
            You get: ${theirTotal.toFixed(2)}
          </Text>
        </View>
        <Text className="mb-3 text-center text-xs font-medium text-foreground">
          {valueDiff > 0
            ? `+$${valueDiff.toFixed(2)} in your favor`
            : valueDiff < 0
              ? `-$${Math.abs(valueDiff).toFixed(2)} against you`
              : 'Even trade'}
        </Text>
        <Button
          size="lg"
          onPress={handleSendOffer}
          disabled={selectedMyIds.size === 0 || createOffer.isPending}
          className="w-full"
        >
          {createOffer.isPending ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-base font-semibold text-primary-foreground">Send Offer</Text>
          )}
        </Button>
      </View>
    </SafeAreaView>
  );
};

export default TradeBuilderScreen;
