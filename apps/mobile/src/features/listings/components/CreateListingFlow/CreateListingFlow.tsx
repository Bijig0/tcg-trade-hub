import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { ArrowLeft, Camera, X, Check } from 'lucide-react-native';
import { cn } from '@/lib/cn';
import Button from '@/components/ui/Button/Button';
import Badge from '@/components/ui/Badge/Badge';
import { useListingFormStore } from '@/stores/listingFormStore/listingFormStore';
import useCreateListing from '../../hooks/useCreateListing/useCreateListing';
import useCreateBulkListings from '../../hooks/useCreateBulkListings/useCreateBulkListings';
import CardSearchInput from '../CardSearchInput/CardSearchInput';
import TypeSelectStep from '../TypeSelectStep/TypeSelectStep';
import MultiCardSelector from '../MultiCardSelector/MultiCardSelector';
import BulkPricingStep from '../BulkPricingStep/BulkPricingStep';
import WantedCardPicker from '../WantedCardPicker/WantedCardPicker';
import WtsConfirmStep from '../WtsConfirmStep/WtsConfirmStep';
import WttConfirmStep from '../WttConfirmStep/WttConfirmStep';
import type { TcgType, CardCondition, NormalizedCard } from '@tcg-trade-hub/database';

const TCG_OPTIONS: { label: string; value: TcgType }[] = [
  { label: 'Pokemon', value: 'pokemon' },
  { label: 'Magic: The Gathering', value: 'mtg' },
  { label: 'Yu-Gi-Oh!', value: 'yugioh' },
];

const CONDITION_OPTIONS: { label: string; value: CardCondition; description: string }[] = [
  { label: 'Near Mint (NM)', value: 'nm', description: 'Minimal to no wear' },
  { label: 'Lightly Played (LP)', value: 'lp', description: 'Minor edge wear or scratches' },
  { label: 'Moderately Played (MP)', value: 'mp', description: 'Noticeable wear, still sleeved' },
  { label: 'Heavily Played (HP)', value: 'hp', description: 'Significant wear visible' },
  { label: 'Damaged (DMG)', value: 'dmg', description: 'Major damage, creases, or tears' },
];

const WTB_TOTAL_STEPS = 7;
const WTS_TOTAL_STEPS = 4;
const WTT_TOTAL_STEPS = 4;

/**
 * Multi-step create listing form with branching per listing type.
 *
 * - WTS (4 steps): Type -> Multi-select from collection -> Bulk pricing -> Confirm & publish
 * - WTT (4 steps): Type -> Multi-select to offer -> Search wanted cards -> Confirm & publish
 * - WTB (7 steps): Type -> TCG -> Card search -> Condition -> Photos -> Notes -> Review & publish
 */
const CreateListingFlow = () => {
  const router = useRouter();
  const store = useListingFormStore();
  const createListing = useCreateListing();
  const createBulkListings = useCreateBulkListings();
  const [isPublishing, setIsPublishing] = useState(false);

  const getTotalSteps = (): number => {
    switch (store.type) {
      case 'wts': return WTS_TOTAL_STEPS;
      case 'wtt': return WTT_TOTAL_STEPS;
      case 'wtb': return WTB_TOTAL_STEPS;
      default: return WTS_TOTAL_STEPS; // default before selection
    }
  };

  const totalSteps = getTotalSteps();

  const getStepLabel = (step: number): string => {
    if (step === 1) return 'Listing Type';

    switch (store.type) {
      case 'wts':
        return ['', '', 'Select Cards', 'Set Prices', 'Review'][step] ?? '';
      case 'wtt':
        return ['', '', 'Select Cards', 'Wanted Cards', 'Review'][step] ?? '';
      case 'wtb':
        return ['', '', 'Select TCG', 'Find Card', 'Condition', 'Photos', 'Notes', 'Review'][step] ?? '';
      default:
        return '';
    }
  };

  // --- WTB helpers (preserved from original) ---

  const handleCardSelect = (card: NormalizedCard, fromCollection = false, condition?: CardCondition) => {
    store.setCard(card);
    store.setCardFromCollection(fromCollection);
    if (fromCollection && condition) {
      store.setCondition(condition);
    }
    if (!fromCollection) {
      store.setAddToCollection(true);
    }
  };

  const handlePickPhoto = async () => {
    if (store.photos.length >= 6) {
      Alert.alert('Limit Reached', 'Maximum 6 photos per listing');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsMultipleSelection: true,
      selectionLimit: 6 - store.photos.length,
    });

    if (!result.canceled) {
      for (const asset of result.assets) {
        store.addPhoto(asset.uri);
      }
    }
  };

  // --- canProceed by type ---

  const canProceed = (): boolean => {
    if (store.step === 1) return store.type !== null;

    switch (store.type) {
      case 'wts':
        switch (store.step) {
          case 2: return store.selectedCards.length > 0;
          case 3: return store.selectedCards.every((sc) => sc.askingPrice.length > 0);
          case 4: return true;
          default: return false;
        }
      case 'wtt':
        switch (store.step) {
          case 2: return store.selectedCards.length > 0;
          case 3: return store.wantedCards.length > 0;
          case 4: return true;
          default: return false;
        }
      case 'wtb':
        switch (store.step) {
          case 2: return store.tcg !== null;
          case 3: return store.card !== null;
          case 4: return store.condition !== null;
          case 5: return true; // photos optional
          case 6: return true; // notes optional
          case 7: return true;
          default: return false;
        }
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (store.step < totalSteps) {
      store.setStep(store.step + 1);
    }
  };

  const handleBack = () => {
    if (store.step > 1) {
      // When going back from step 2 to step 1, clear flow-specific state
      if (store.step === 2) {
        const currentType = store.type;
        store.reset();
        // Keep type selected so user sees which they picked
        if (currentType) store.setType(currentType);
      } else {
        store.setStep(store.step - 1);
      }
    } else {
      store.reset();
      router.back();
    }
  };

  // --- Publish handlers ---

  const handlePublishWtb = async () => {
    if (!store.type || !store.tcg || !store.card || !store.condition) {
      Alert.alert('Error', 'Please complete all required fields');
      return;
    }

    setIsPublishing(true);

    const shouldAddToCollection =
      store.addToCollection &&
      !store.cardFromCollection &&
      (store.type === 'wts' || store.type === 'wtt');

    createListing.mutate(
      {
        type: store.type,
        tcg: store.tcg,
        card_name: store.card.name,
        card_set: store.card.setName,
        card_number: store.card.number,
        card_external_id: store.card.externalId,
        card_image_url: store.card.imageUrl,
        card_rarity: store.card.rarity ?? null,
        card_market_price: store.card.marketPrice ?? null,
        condition: store.condition,
        asking_price: store.askingPrice ? parseFloat(store.askingPrice) : null,
        description: store.description || null,
        photos: store.photos,
        addToCollection: shouldAddToCollection,
      },
      {
        onSuccess: () => {
          store.reset();
          router.back();
          Alert.alert('Success', 'Your listing has been published!');
        },
        onError: (error) => {
          Alert.alert('Error', error.message);
        },
        onSettled: () => {
          setIsPublishing(false);
        },
      },
    );
  };

  const handlePublishBulk = async () => {
    if (store.selectedCards.length === 0) {
      Alert.alert('Error', 'No cards selected');
      return;
    }

    setIsPublishing(true);

    createBulkListings.mutate(
      {
        type: store.type as 'wts' | 'wtt',
        selectedCards: store.selectedCards,
        wantedCards: store.type === 'wtt' ? store.wantedCards : undefined,
      },
      {
        onSuccess: (listings) => {
          store.reset();
          router.back();
          Alert.alert(
            'Success',
            `${listings.length} listing${listings.length !== 1 ? 's' : ''} published!`,
          );
        },
        onError: (error) => {
          Alert.alert('Error', error.message);
        },
        onSettled: () => {
          setIsPublishing(false);
        },
      },
    );
  };

  const handlePublish = () => {
    if (store.type === 'wtb') {
      handlePublishWtb();
    } else {
      handlePublishBulk();
    }
  };

  // --- Render step content by type ---

  const renderWtsStep = () => {
    switch (store.step) {
      case 2:
        return (
          <MultiCardSelector
            selectedCards={store.selectedCards}
            onToggle={store.toggleSelectedCard}
          />
        );
      case 3:
        return (
          <BulkPricingStep
            selectedCards={store.selectedCards}
            onUpdatePrice={store.updateSelectedCardPrice}
            onSetAllToMarket={store.setAllPricesToMarket}
          />
        );
      case 4:
        return <WtsConfirmStep selectedCards={store.selectedCards} />;
      default:
        return null;
    }
  };

  const renderWttStep = () => {
    switch (store.step) {
      case 2:
        return (
          <MultiCardSelector
            selectedCards={store.selectedCards}
            onToggle={store.toggleSelectedCard}
          />
        );
      case 3:
        return (
          <WantedCardPicker
            selectedCards={store.selectedCards}
            wantedCards={store.wantedCards}
            onAddWanted={store.addWantedCard}
            onRemoveWanted={store.removeWantedCard}
          />
        );
      case 4:
        return (
          <WttConfirmStep
            selectedCards={store.selectedCards}
            wantedCards={store.wantedCards}
          />
        );
      default:
        return null;
    }
  };

  const renderWtbStep = () => {
    switch (store.step) {
      // Step 2: TCG Selection
      case 2:
        return (
          <View className="gap-3">
            <Text className="mb-2 text-base text-muted-foreground">
              Which trading card game?
            </Text>
            {TCG_OPTIONS.map((opt) => (
              <Pressable
                key={opt.value}
                onPress={() => store.setTcg(opt.value)}
                className={cn(
                  'rounded-xl border p-4',
                  store.tcg === opt.value
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-card',
                )}
              >
                <Text className="text-base font-semibold text-foreground">{opt.label}</Text>
                {store.tcg === opt.value && (
                  <View className="absolute right-3 top-3">
                    <Check size={20} className="text-primary" />
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        );

      // Step 3: Card Search
      case 3:
        return (
          <View className="gap-4">
            <Text className="text-base text-muted-foreground">
              Search for the card you want to buy.
            </Text>
            <CardSearchInput tcg={store.tcg} onSelect={handleCardSelect} />

            {store.card && (
              <View className="mt-2 flex-row items-center gap-3 rounded-xl border border-primary bg-primary/5 p-3">
                <Image
                  source={{ uri: store.card.imageUrl }}
                  className="h-20 w-14 rounded-lg bg-muted"
                  resizeMode="cover"
                />
                <View className="flex-1">
                  <Text className="text-base font-semibold text-foreground">
                    {store.card.name}
                  </Text>
                  <Text className="text-sm text-muted-foreground">
                    {store.card.setName} &middot; #{store.card.number}
                  </Text>
                  {store.card.marketPrice != null && (
                    <Text className="mt-1 text-sm text-muted-foreground">
                      Market: ${store.card.marketPrice.toFixed(2)}
                    </Text>
                  )}
                </View>
                <Check size={20} className="text-primary" />
              </View>
            )}
          </View>
        );

      // Step 4: Condition
      case 4:
        return (
          <View className="gap-3">
            <Text className="mb-2 text-base text-muted-foreground">
              What condition are you looking for?
            </Text>
            {CONDITION_OPTIONS.map((opt) => (
              <Pressable
                key={opt.value}
                onPress={() => store.setCondition(opt.value)}
                className={cn(
                  'rounded-xl border p-4',
                  store.condition === opt.value
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-card',
                )}
              >
                <Text className="text-base font-semibold text-foreground">{opt.label}</Text>
                <Text className="mt-0.5 text-sm text-muted-foreground">{opt.description}</Text>
                {store.condition === opt.value && (
                  <View className="absolute right-3 top-3">
                    <Check size={20} className="text-primary" />
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        );

      // Step 5: Photos
      case 5:
        return (
          <View className="gap-4">
            <Text className="text-base text-muted-foreground">
              Add up to 6 photos of your card (optional).
            </Text>
            <View className="flex-row flex-wrap gap-3">
              {store.photos.map((uri, index) => (
                <View key={`photo-${index}`} className="relative">
                  <Image
                    source={{ uri }}
                    className="h-24 w-24 rounded-lg bg-muted"
                    resizeMode="cover"
                  />
                  <Pressable
                    onPress={() => store.removePhoto(index)}
                    className="absolute -right-2 -top-2 h-6 w-6 items-center justify-center rounded-full bg-destructive"
                  >
                    <X size={12} color="white" />
                  </Pressable>
                </View>
              ))}

              {store.photos.length < 6 && (
                <Pressable
                  onPress={handlePickPhoto}
                  className="h-24 w-24 items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50"
                >
                  <Camera size={24} className="text-muted-foreground" />
                  <Text className="mt-1 text-xs text-muted-foreground">Add</Text>
                </Pressable>
              )}
            </View>
          </View>
        );

      // Step 6: Notes
      case 6:
        return (
          <View className="gap-4">
            <Text className="text-base text-muted-foreground">
              Add any notes about this listing (optional).
            </Text>
            <TextInput
              value={store.description}
              onChangeText={store.setDescription}
              placeholder="e.g., Looking for NM only, willing to pay above market..."
              multiline
              numberOfLines={5}
              maxLength={500}
              textAlignVertical="top"
              className="min-h-[120px] rounded-lg border border-input bg-background px-4 py-3 text-base text-foreground"
              placeholderTextColor="#a1a1aa"
            />
            <Text className="text-right text-xs text-muted-foreground">
              {store.description.length}/500
            </Text>
          </View>
        );

      // Step 7: Review
      case 7:
        return (
          <View className="gap-4">
            <Text className="mb-2 text-base font-medium text-foreground">
              Review your listing
            </Text>

            {store.card && (
              <View className="flex-row gap-3 rounded-xl border border-border bg-card p-4">
                <Image
                  source={{ uri: store.card.imageUrl }}
                  className="h-28 w-20 rounded-lg bg-muted"
                  resizeMode="cover"
                />
                <View className="flex-1 gap-1">
                  <Text className="text-lg font-bold text-card-foreground">
                    {store.card.name}
                  </Text>
                  <Text className="text-sm text-muted-foreground">
                    {store.card.setName}
                  </Text>
                  <View className="mt-1 flex-row gap-2">
                    {store.type && (
                      <Badge variant="default">{store.type.toUpperCase()}</Badge>
                    )}
                    {store.condition && (
                      <Badge variant="outline">{store.condition.toUpperCase()}</Badge>
                    )}
                  </View>
                </View>
              </View>
            )}

            {store.photos.length > 0 && (
              <View>
                <Text className="mb-2 text-sm font-medium text-muted-foreground">
                  Photos ({store.photos.length})
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View className="flex-row gap-2">
                    {store.photos.map((uri, index) => (
                      <Image
                        key={`review-photo-${index}`}
                        source={{ uri }}
                        className="h-16 w-16 rounded-lg bg-muted"
                        resizeMode="cover"
                      />
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}

            {store.description ? (
              <View>
                <Text className="mb-1 text-sm font-medium text-muted-foreground">Notes</Text>
                <Text className="text-sm text-foreground">{store.description}</Text>
              </View>
            ) : null}
          </View>
        );

      default:
        return null;
    }
  };

  const renderStepContent = () => {
    if (store.step === 1) {
      return (
        <TypeSelectStep
          selectedType={store.type}
          onSelect={(type) => {
            // On type change, clear flow-specific state
            if (store.type && store.type !== type) {
              store.reset();
            }
            store.setType(type);
          }}
        />
      );
    }

    switch (store.type) {
      case 'wts': return renderWtsStep();
      case 'wtt': return renderWttStep();
      case 'wtb': return renderWtbStep();
      default: return null;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center border-b border-border px-4 py-3">
        <Pressable onPress={handleBack} className="mr-3 p-1">
          <ArrowLeft size={24} className="text-foreground" />
        </Pressable>
        <View className="flex-1">
          <Text className="text-lg font-semibold text-foreground">
            {getStepLabel(store.step)}
          </Text>
          <Text className="text-xs text-muted-foreground">
            Step {store.step} of {totalSteps}
          </Text>
        </View>
      </View>

      {/* Step indicator */}
      <View className="flex-row gap-1 px-4 py-3">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <View
            key={`step-${i}`}
            className={cn(
              'h-1 flex-1 rounded-full',
              i + 1 <= store.step ? 'bg-primary' : 'bg-muted',
            )}
          />
        ))}
      </View>

      {/* Step content */}
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 py-4"
        keyboardShouldPersistTaps="handled"
      >
        {renderStepContent()}
      </ScrollView>

      {/* Bottom navigation */}
      <View className="border-t border-border bg-background px-4 pb-6 pt-3">
        {store.step === totalSteps && store.type ? (
          <Button
            size="lg"
            onPress={handlePublish}
            disabled={isPublishing}
            className="w-full"
          >
            {isPublishing ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-base font-semibold text-primary-foreground">
                {store.type === 'wtb'
                  ? 'Publish Listing'
                  : `Publish ${store.selectedCards.length} Listing${store.selectedCards.length !== 1 ? 's' : ''}`}
              </Text>
            )}
          </Button>
        ) : (
          <Button
            size="lg"
            onPress={handleNext}
            disabled={!canProceed()}
            className="w-full"
          >
            <Text className="text-base font-semibold text-primary-foreground">Next</Text>
          </Button>
        )}
      </View>
    </SafeAreaView>
  );
};

export default CreateListingFlow;
