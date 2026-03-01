import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, DollarSign, MapPin } from 'lucide-react-native';
import { Pressable, ScrollView } from 'react-native';
import { cn } from '@/lib/cn';
import Button from '@/components/ui/Button/Button';
import { useListingFormStore } from '@/stores/listingFormStore/listingFormStore';
import { useAuth } from '@/context/AuthProvider';
import parseLocationCoords from '@/utils/parseLocationCoords/parseLocationCoords';
import LocationPicker from '@/components/LocationPicker/LocationPicker';
import LocationPreview from '@/components/LocationPreview/LocationPreview';
import useCreateBundleListing from '../../hooks/useCreateBundleListing/useCreateBundleListing';
import MultiCardSelector from '../MultiCardSelector/MultiCardSelector';
import BundleConfirmStep from '../BundleConfirmStep/BundleConfirmStep';
import WantConfigStep from '../WantConfigStep/WantConfigStep';

const STEP_LABELS: Record<number, string> = {
  1: 'Select Cards',
  2: 'What You Want',
  3: 'Details',
  4: 'Review',
};

const TOTAL_STEPS = 4;

/**
 * Have/Want listing creation flow.
 *
 * Step 1: Cards — what cards do you HAVE? (required, at least 1)
 * Step 2: Wants — toggle Cash/Trades + inline pricing/trade wants
 * Step 3: Details — cash sweetener (if trades), description
 * Step 4: Review — summary with auto-derived badge + manual override
 */
const CreateListingFlow = () => {
  const router = useRouter();
  const store = useListingFormStore();
  const { profile } = useAuth();
  const createBundleListing = useCreateBundleListing();
  const [isPublishing, setIsPublishing] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  // Auto-fill location from profile when entering step 3 (if store location is null)
  useEffect(() => {
    if (store.step === 3 && !store.locationCoords && profile?.location) {
      const coords = parseLocationCoords(profile.location);
      if (coords) {
        store.setLocation(coords, '');
      }
    }
  }, [store.step]);

  const canProceed = (): boolean => {
    switch (store.step) {
      case 1:
        return store.selectedCards.length > 0;
      case 2:
        return store.acceptsCash || store.acceptsTrades;
      case 3:
        return true;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (store.step < TOTAL_STEPS) {
      store.setStep(store.step + 1);
    }
  };

  const handleBack = () => {
    if (store.step > 1) {
      store.setStep(store.step - 1);
    } else {
      store.reset();
      router.back();
    }
  };

  const handlePublish = async () => {
    if (store.selectedCards.length === 0) {
      Alert.alert('Error', 'Please add at least one card');
      return;
    }

    if (!store.acceptsCash && !store.acceptsTrades) {
      Alert.alert('Error', 'Please select what you want (cash or trades)');
      return;
    }

    setIsPublishing(true);

    const effectiveType = store.getEffectiveType();

    createBundleListing.mutate(
      {
        type: effectiveType,
        selectedCards: store.selectedCards,
        cashAmount: parseFloat(store.cashAmount) || 0,
        description: store.description || null,
        tradeWants: store.tradeWants,
        acceptsCash: store.acceptsCash,
        acceptsTrades: store.acceptsTrades,
        locationCoords: store.locationCoords,
        locationName: store.locationName || null,
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

  const renderStepContent = () => {
    switch (store.step) {
      case 1:
        return (
          <MultiCardSelector
            selectedCards={store.selectedCards}
            onToggle={store.toggleSelectedCard}
          />
        );

      case 2:
        return (
          <WantConfigStep
            acceptsCash={store.acceptsCash}
            acceptsTrades={store.acceptsTrades}
            onSetAcceptsCash={store.setAcceptsCash}
            onSetAcceptsTrades={store.setAcceptsTrades}
            selectedCards={store.selectedCards}
            onUpdatePrice={store.updateSelectedCardPrice}
            onSetAllToMarket={store.setAllPricesToMarket}
            tradeWants={store.tradeWants}
            onAddTradeWant={store.addTradeWant}
            onRemoveTradeWant={store.removeTradeWant}
          />
        );

      case 3: {
        const showCashSweetener = store.acceptsTrades;
        return (
          <View className="gap-4">
            {showCashSweetener && (
              <>
                <Text className="text-base text-muted-foreground">
                  Add cash sweetener? (optional)
                </Text>
                <View className="flex-row items-center rounded-lg border border-input bg-background px-3 py-3">
                  <DollarSign size={18} className="text-muted-foreground" />
                  <TextInput
                    value={store.cashAmount}
                    onChangeText={store.setCashAmount}
                    keyboardType="decimal-pad"
                    placeholder="Enter amount (or leave at 0)"
                    className="flex-1 text-lg text-foreground"
                    placeholderTextColor="#a1a1aa"
                  />
                </View>
              </>
            )}

            {/* Location */}
            <View className="gap-2">
              <View className="flex-row items-center justify-between">
                <Text className="text-base text-muted-foreground">
                  Listing location
                </Text>
                <Pressable onPress={() => setShowLocationPicker(true)}>
                  <Text className="text-sm font-medium text-primary">Change</Text>
                </Pressable>
              </View>
              {store.locationCoords ? (
                <LocationPreview
                  location={store.locationCoords}
                  locationName={store.locationName}
                  onPress={() => setShowLocationPicker(true)}
                />
              ) : (
                <Pressable
                  onPress={() => setShowLocationPicker(true)}
                  className="flex-row items-center gap-2 rounded-lg border border-dashed border-border p-4"
                >
                  <MapPin size={18} className="text-muted-foreground" />
                  <Text className="text-sm text-muted-foreground">
                    Tap to set listing location
                  </Text>
                </Pressable>
              )}
            </View>

            <Modal
              visible={showLocationPicker}
              animationType="slide"
              presentationStyle="pageSheet"
              onRequestClose={() => setShowLocationPicker(false)}
            >
              <SafeAreaView className="flex-1 bg-background" edges={['top']}>
                <View className="flex-row items-center border-b border-border px-4 py-3">
                  <Pressable onPress={() => setShowLocationPicker(false)} className="mr-3 p-1">
                    <ArrowLeft size={24} className="text-foreground" />
                  </Pressable>
                  <Text className="text-lg font-semibold text-foreground">Set Location</Text>
                </View>
                <View className="flex-1 px-4 pt-4">
                  <LocationPicker
                    initialLocation={store.locationCoords}
                    initialLocationName={store.locationName}
                    onLocationChange={(coords, name) => {
                      store.setLocation(coords, name);
                    }}
                    mapHeight={300}
                  />
                  <View className="mt-4">
                    <Button size="lg" onPress={() => setShowLocationPicker(false)} className="w-full">
                      <Text className="text-base font-semibold text-primary-foreground">Done</Text>
                    </Button>
                  </View>
                </View>
              </SafeAreaView>
            </Modal>

            <Text className="text-base text-muted-foreground">
              Notes (optional)
            </Text>
            <TextInput
              value={store.description}
              onChangeText={store.setDescription}
              placeholder="Any additional details..."
              multiline
              numberOfLines={4}
              maxLength={500}
              textAlignVertical="top"
              className="min-h-[100px] rounded-lg border border-input bg-background px-4 py-3 text-base text-foreground"
              placeholderTextColor="#a1a1aa"
            />
            <Text className="text-right text-xs text-muted-foreground">
              {store.description.length}/500
            </Text>
          </View>
        );
      }

      case 4:
        return (
          <BundleConfirmStep
            effectiveType={store.getEffectiveType()}
            acceptsCash={store.acceptsCash}
            acceptsTrades={store.acceptsTrades}
            selectedCards={store.selectedCards}
            cashAmount={store.cashAmount}
            description={store.description || null}
            tradeWants={store.tradeWants}
            typeOverride={store.typeOverride}
            onTypeOverride={store.setTypeOverride}
            locationCoords={store.locationCoords}
            locationName={store.locationName}
          />
        );

      default:
        return null;
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
            {STEP_LABELS[store.step] ?? ''}
          </Text>
          <Text className="text-xs text-muted-foreground">
            Step {store.step} of {TOTAL_STEPS}
          </Text>
        </View>
      </View>

      {/* Step indicator */}
      <View className="flex-row gap-1 px-4 py-3">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
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
        {store.step === TOTAL_STEPS ? (
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
                Publish Listing
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
