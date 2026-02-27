import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, Alert, ActivityIndicator } from 'react-native';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { DollarSign, Handshake } from 'lucide-react-native';
import Button from '@/components/ui/Button/Button';
import MultiCardSelector from '../MultiCardSelector/MultiCardSelector';
import useCreateOffer from '../../hooks/useCreateOffer/useCreateOffer';
import type { ListingWithDistance } from '@/features/feed/schemas';
import type { SelectedCard } from '../../schemas';
import type { CardCondition, NormalizedCard } from '@tcg-trade-hub/database';

type OfferCreationSheetProps = {
  listing: ListingWithDistance;
  bottomSheetRef: React.RefObject<BottomSheet>;
};

/**
 * Bottom sheet for creating an offer on a listing.
 * Shows card selector, cash input, message field, and value comparison.
 */
const OfferCreationSheet = ({ listing, bottomSheetRef }: OfferCreationSheetProps) => {
  const createOffer = useCreateOffer();
  const [selectedCards, setSelectedCards] = useState<SelectedCard[]>([]);
  const [cashAmount, setCashAmount] = useState('');
  const [offeringNote, setOfferingNote] = useState('');

  const handleToggleCard = useCallback(
    (card: NormalizedCard, condition: CardCondition, fromCollection: boolean, selectionId: string) => {
      setSelectedCards((prev) => {
        const idx = prev.findIndex((sc) => sc.selectionId === selectionId);
        if (idx >= 0) {
          return prev.filter((_, i) => i !== idx);
        }
        return [...prev, { card, condition, fromCollection, addToCollection: false, askingPrice: '', selectionId }];
      });
    },
    [],
  );

  const offerValue = selectedCards.reduce(
    (sum, sc) => sum + (sc.card.marketPrice ?? 0),
    0,
  ) + (parseFloat(cashAmount) || 0);

  const handleSubmit = () => {
    if (selectedCards.length === 0 && !cashAmount) {
      Alert.alert('Error', 'Please select cards or enter a cash amount');
      return;
    }

    createOffer.mutate(
      {
        listingId: listing.id,
        selectedCards,
        cashAmount: parseFloat(cashAmount) || 0,
        offeringNote: offeringNote || null,
      },
      {
        onSuccess: () => {
          setSelectedCards([]);
          setCashAmount('');
          setOfferingNote('');
          bottomSheetRef.current?.close();
          Alert.alert('Success', 'Your offer has been sent!');
        },
        onError: (error) => {
          Alert.alert('Error', error.message);
        },
      },
    );
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={['70%', '90%']}
      enablePanDownToClose
      backgroundStyle={{ borderRadius: 20, backgroundColor: '#0f0f13' }}
      handleIndicatorStyle={{ backgroundColor: '#a1a1aa', width: 40 }}
    >
      <BottomSheetScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="px-4 py-3">
          <View className="flex-row items-center gap-2">
            <Handshake size={20} color="#f59e0b" />
            <Text className="text-lg font-semibold text-foreground">
              Make Offer
            </Text>
          </View>
          <Text className="mt-1 text-sm text-muted-foreground" numberOfLines={1}>
            for "{listing.title}"
          </Text>

          <Text className="mt-4 text-sm font-medium text-muted-foreground">
            Select cards to offer:
          </Text>

          <View className="mt-2">
            <MultiCardSelector
              selectedCards={selectedCards}
              onToggle={handleToggleCard}
            />
          </View>

          <Text className="mt-4 text-sm font-medium text-muted-foreground">
            Cash amount:
          </Text>
          <View className="mt-2 flex-row items-center rounded-lg border border-input bg-background px-3 py-3">
            <DollarSign size={18} className="text-muted-foreground" />
            <TextInput
              value={cashAmount}
              onChangeText={setCashAmount}
              keyboardType="decimal-pad"
              placeholder="0.00"
              className="flex-1 text-lg text-foreground"
              placeholderTextColor="#a1a1aa"
            />
          </View>

          <Text className="mt-4 text-sm font-medium text-muted-foreground">
            Note about your offer (optional):
          </Text>
          <TextInput
            value={offeringNote}
            onChangeText={setOfferingNote}
            placeholder="Add a note about your cards..."
            multiline
            maxLength={500}
            textAlignVertical="top"
            className="mt-2 min-h-[80px] rounded-lg border border-input bg-background px-4 py-3 text-base text-foreground"
            placeholderTextColor="#a1a1aa"
          />

          {/* Value comparison */}
          <View className="mt-4 flex-row items-center justify-between rounded-xl border border-border bg-card p-3">
            <View className="items-center">
              <Text className="text-xs text-muted-foreground">Your offer</Text>
              <Text className="text-base font-semibold text-foreground">
                ${offerValue.toFixed(2)}
              </Text>
            </View>
            <View className="items-center">
              <Text className="text-xs text-muted-foreground">Their asking</Text>
              <Text className="text-base font-semibold text-foreground">
                ${listing.total_value.toFixed(2)}
              </Text>
            </View>
          </View>

          <Button
            size="lg"
            onPress={handleSubmit}
            disabled={createOffer.isPending}
            className="mt-4 w-full bg-amber-500 active:bg-amber-600"
          >
            {createOffer.isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <View className="flex-row items-center gap-2">
                <Handshake size={18} color="white" />
                <Text className="text-base font-bold text-white">
                  Submit Offer
                </Text>
              </View>
            )}
          </Button>
        </View>
      </BottomSheetScrollView>
    </BottomSheet>
  );
};

export default OfferCreationSheet;
