import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, Pressable, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import type { TcgType, NormalizedCard, GradingCompany } from '@tcg-trade-hub/database';
import useCardSearch from '@/features/listings/hooks/useCardSearch/useCardSearch';
import useAddCollectionItem from '../../hooks/useAddCollectionItem/useAddCollectionItem';
import useAddWishlistItem from '../../hooks/useAddWishlistItem/useAddWishlistItem';
import Input from '@/components/ui/Input/Input';
import Button from '@/components/ui/Button/Button';
import Select from '@/components/ui/Select/Select';
import Badge from '@/components/ui/Badge/Badge';
import {
  TCG_LABELS,
  CONDITION_LABELS,
  GRADING_COMPANY_LABELS,
  GRADING_SCORE_OPTIONS,
} from '@/config/constants';

type Step = 'tcg' | 'search' | 'details';

const CONDITION_OPTIONS = Object.entries(CONDITION_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const GRADING_OPTIONS = Object.entries(GRADING_COMPANY_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const AddCardScreen: React.FC = () => {
  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const isWishlist = mode === 'wishlist';

  const [step, setStep] = useState<Step>('tcg');
  const [selectedTcg, setSelectedTcg] = useState<TcgType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCard, setSelectedCard] = useState<NormalizedCard | null>(null);
  const [condition, setCondition] = useState('nm');
  const [quantity, setQuantity] = useState(1);
  const [isGraded, setIsGraded] = useState(false);
  const [gradingCompany, setGradingCompany] = useState<GradingCompany | ''>('');
  const [gradingScore, setGradingScore] = useState('');

  const { data: searchResults, isLoading: isSearching } = useCardSearch({
    tcg: selectedTcg,
    query: searchQuery,
  });

  const addToCollection = useAddCollectionItem();
  const addToWishlist = useAddWishlistItem();

  const handleSelectTcg = useCallback((tcg: TcgType) => {
    setSelectedTcg(tcg);
    setStep('search');
  }, []);

  const handleSelectCard = useCallback((card: NormalizedCard) => {
    setSelectedCard(card);
    setStep('details');
  }, []);

  const handleAdd = useCallback(() => {
    if (!selectedCard || !selectedTcg) return;

    const item = {
      tcg: selectedTcg,
      external_id: selectedCard.externalId,
      card_name: selectedCard.name,
      set_name: selectedCard.setName,
      set_code: selectedCard.setCode,
      card_number: selectedCard.number,
      image_url: selectedCard.imageUrl,
      rarity: selectedCard.rarity,
      condition: condition as 'nm' | 'lp' | 'mp' | 'hp' | 'dmg',
      quantity,
      market_price: selectedCard.marketPrice,
      grading_company: isGraded && gradingCompany ? (gradingCompany as GradingCompany) : null,
      grading_score: isGraded && gradingScore ? gradingScore : null,
    };

    if (isWishlist) {
      addToWishlist.mutate(item, { onSuccess: () => router.back() });
    } else {
      addToCollection.mutate(item, { onSuccess: () => router.back() });
    }
  }, [selectedCard, selectedTcg, condition, quantity, isGraded, gradingCompany, gradingScore, isWishlist, addToCollection, addToWishlist, router]);

  const scoreOptions = gradingCompany && gradingCompany in GRADING_SCORE_OPTIONS
    ? GRADING_SCORE_OPTIONS[gradingCompany as GradingCompany].map((s) => ({ value: s, label: s }))
    : [];

  // Step 1: TCG selection
  if (step === 'tcg') {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-1 px-4 pt-6">
        <Text className="mb-2 text-xl font-bold text-foreground">
          {isWishlist ? 'Add to Wishlist' : 'Add to Collection'}
        </Text>
        <Text className="mb-6 text-sm text-muted-foreground">Select a trading card game</Text>

        {(Object.entries(TCG_LABELS) as [TcgType, string][]).map(([key, label]) => (
          <Pressable
            key={key}
            onPress={() => handleSelectTcg(key)}
            className="mb-3 rounded-xl bg-card p-4 active:bg-accent"
          >
            <Text className="text-base font-semibold text-foreground">{label}</Text>
          </Pressable>
        ))}

        <Button variant="ghost" className="mt-4" onPress={() => router.back()}>
          <Text className="text-sm text-muted-foreground">Cancel</Text>
        </Button>
      </View>
      </SafeAreaView>
    );
  }

  // Step 2: Card search
  if (step === 'search') {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-1 px-4 pt-6">
        <View className="mb-4 flex-row items-center">
          <Pressable onPress={() => setStep('tcg')} className="mr-3 p-1">
            <Text className="text-lg text-primary">Back</Text>
          </Pressable>
          <Text className="text-xl font-bold text-foreground">Search Cards</Text>
        </View>

        <Input
          placeholder="Search by card name..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoFocus
          className="mb-4"
        />

        {isSearching ? (
          <Text className="py-8 text-center text-sm text-muted-foreground">Searching...</Text>
        ) : null}

        <FlatList
          data={searchResults ?? []}
          keyExtractor={(item) => item.externalId}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => handleSelectCard(item)}
              className="mb-2 flex-row items-center rounded-xl bg-card p-3 active:bg-accent"
            >
              {item.imageUrl ? (
                <Image
                  source={{ uri: item.imageUrl }}
                  className="h-16 w-12 rounded-md"
                  resizeMode="cover"
                />
              ) : (
                <View className="h-16 w-12 items-center justify-center rounded-md bg-muted">
                  <Text className="text-xs text-muted-foreground">?</Text>
                </View>
              )}
              <View className="ml-3 flex-1">
                <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
                  {item.name}
                </Text>
                <Text className="text-xs text-muted-foreground" numberOfLines={1}>
                  {item.setName} #{item.number}
                </Text>
                <View className="mt-1 flex-row items-center gap-2">
                  {item.rarity ? <Badge variant="secondary">{item.rarity}</Badge> : null}
                  {item.marketPrice != null ? (
                    <Text className="text-xs font-medium text-green-600">
                      ${item.marketPrice.toFixed(2)}
                    </Text>
                  ) : null}
                </View>
              </View>
            </Pressable>
          )}
          ListEmptyComponent={
            searchQuery.length >= 2 && !isSearching ? (
              <Text className="py-8 text-center text-sm text-muted-foreground">
                No cards found
              </Text>
            ) : null
          }
        />
      </View>
      </SafeAreaView>
    );
  }

  // Step 3: Card details
  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
    <ScrollView className="flex-1 px-4 pt-6">
      <View className="mb-4 flex-row items-center">
        <Pressable onPress={() => setStep('search')} className="mr-3 p-1">
          <Text className="text-lg text-primary">Back</Text>
        </Pressable>
        <Text className="text-xl font-bold text-foreground">Card Details</Text>
      </View>

      {selectedCard ? (
        <>
          <View className="mb-4 items-center">
            {selectedCard.imageUrl ? (
              <Image
                source={{ uri: selectedCard.imageUrl }}
                className="h-64 w-44 rounded-xl"
                resizeMode="contain"
              />
            ) : null}
            <Text className="mt-3 text-lg font-bold text-foreground">{selectedCard.name}</Text>
            <Text className="text-sm text-muted-foreground">
              {selectedCard.setName} #{selectedCard.number}
            </Text>
            {selectedCard.marketPrice != null ? (
              <Text className="mt-1 text-base font-semibold text-green-600">
                Market: ${selectedCard.marketPrice.toFixed(2)}
              </Text>
            ) : null}
          </View>

          <Select
            label="Condition"
            value={condition}
            onValueChange={setCondition}
            options={CONDITION_OPTIONS}
            placeholder="Select condition"
          />

          <View className="mt-4">
            <Pressable
              onPress={() => {
                setIsGraded(!isGraded);
                if (isGraded) {
                  setGradingCompany('');
                  setGradingScore('');
                }
              }}
              className="flex-row items-center gap-2"
            >
              <View className={`h-5 w-5 rounded border ${isGraded ? 'border-primary bg-primary' : 'border-input bg-background'}`}>
                {isGraded ? <Text className="text-center text-xs text-primary-foreground">X</Text> : null}
              </View>
              <Text className="text-sm font-medium text-foreground">Graded card</Text>
            </Pressable>
          </View>

          {isGraded ? (
            <View className="mt-3 gap-3">
              <Select
                label="Grading Company"
                value={gradingCompany}
                onValueChange={(v) => {
                  setGradingCompany(v as GradingCompany);
                  setGradingScore('');
                }}
                options={GRADING_OPTIONS}
                placeholder="Select company"
              />
              {gradingCompany ? (
                <Select
                  label="Grade"
                  value={gradingScore}
                  onValueChange={setGradingScore}
                  options={scoreOptions}
                  placeholder="Select grade"
                />
              ) : null}
            </View>
          ) : null}

          <View className="mt-4">
            <Text className="mb-1.5 text-sm font-medium text-foreground">Quantity</Text>
            <View className="flex-row items-center gap-3">
              <Pressable
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                className="h-10 w-10 items-center justify-center rounded-lg bg-muted"
              >
                <Text className="text-lg font-bold text-foreground">-</Text>
              </Pressable>
              <Text className="min-w-[32px] text-center text-lg font-semibold text-foreground">
                {quantity}
              </Text>
              <Pressable
                onPress={() => setQuantity(Math.min(99, quantity + 1))}
                className="h-10 w-10 items-center justify-center rounded-lg bg-muted"
              >
                <Text className="text-lg font-bold text-foreground">+</Text>
              </Pressable>
            </View>
          </View>

          <Button
            className="mb-12 mt-6"
            onPress={handleAdd}
            disabled={addToCollection.isPending || addToWishlist.isPending}
          >
            {isWishlist ? 'Add to Wishlist' : 'Add to Collection'}
          </Button>
        </>
      ) : null}
    </ScrollView>
    </SafeAreaView>
  );
};

export default AddCardScreen;
