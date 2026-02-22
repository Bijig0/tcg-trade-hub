import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, DollarSign } from 'lucide-react-native';
import { Pressable, ScrollView } from 'react-native';
import { cn } from '@/lib/cn';
import Button from '@/components/ui/Button/Button';
import { useListingFormStore } from '@/stores/listingFormStore/listingFormStore';
import useCreateBundleListing from '../../hooks/useCreateBundleListing/useCreateBundleListing';
import TypeSelectStep from '../TypeSelectStep/TypeSelectStep';
import MultiCardSelector from '../MultiCardSelector/MultiCardSelector';
import BulkPricingStep from '../BulkPricingStep/BulkPricingStep';
import BundleConfirmStep from '../BundleConfirmStep/BundleConfirmStep';

const TOTAL_STEPS = 4;

const STEP_LABELS: Record<number, string> = {
  1: 'Listing Type',
  2: 'Select Cards',
  3: 'Set Price',
  4: 'Review',
};

const CASH_LABELS: Record<string, { label: string; placeholder: string }> = {
  wtb: { label: 'What\'s your budget?', placeholder: 'Enter budget amount' },
  wtt: { label: 'Add cash sweetener? (optional)', placeholder: 'Enter amount (or leave at 0)' },
};

/**
 * Unified 4-step create listing flow for all types (WTS, WTB, WTT).
 *
 * Step 1: Type Selection
 * Step 2: Select Cards (from collection or search)
 * Step 3: Pricing — WTS: per-card pricing, WTB: budget, WTT: cash sweetener
 * Step 4: Review & Publish
 */
const CreateListingFlow = () => {
  const router = useRouter();
  const store = useListingFormStore();
  const createBundleListing = useCreateBundleListing();
  const [isPublishing, setIsPublishing] = useState(false);

  const canProceed = (): boolean => {
    if (store.step === 1) return store.type !== null;

    switch (store.step) {
      case 2: return store.selectedCards.length > 0;
      case 3:
        if (store.type === 'wts') {
          return store.selectedCards.every((sc) => sc.askingPrice.length > 0);
        }
        return true; // Cash is optional for WTB/WTT
      case 4: return true;
      default: return false;
    }
  };

  const handleNext = () => {
    if (store.step < TOTAL_STEPS) {
      store.setStep(store.step + 1);
    }
  };

  const handleBack = () => {
    if (store.step > 1) {
      if (store.step === 2) {
        const currentType = store.type;
        store.reset();
        if (currentType) store.setType(currentType);
      } else {
        store.setStep(store.step - 1);
      }
    } else {
      store.reset();
      router.back();
    }
  };

  const handlePublish = async () => {
    if (!store.type || store.selectedCards.length === 0) {
      Alert.alert('Error', 'Please complete all required fields');
      return;
    }

    setIsPublishing(true);

    createBundleListing.mutate(
      {
        type: store.type,
        selectedCards: store.selectedCards,
        cashAmount: parseFloat(store.cashAmount) || 0,
        description: store.description || null,
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
    if (store.step === 1) {
      return (
        <TypeSelectStep
          selectedType={store.type}
          onSelect={(type) => {
            if (store.type && store.type !== type) {
              store.reset();
            }
            store.setType(type);
          }}
        />
      );
    }

    switch (store.step) {
      case 2:
        return (
          <MultiCardSelector
            selectedCards={store.selectedCards}
            onToggle={store.toggleSelectedCard}
          />
        );

      case 3:
        if (store.type === 'wts') {
          return (
            <BulkPricingStep
              selectedCards={store.selectedCards}
              onUpdatePrice={store.updateSelectedCardPrice}
              onSetAllToMarket={store.setAllPricesToMarket}
            />
          );
        }
        // WTB/WTT: simple cash input
        {
          const cashConfig = CASH_LABELS[store.type ?? 'wtb'];
          return (
            <View className="gap-4">
              <Text className="text-base text-muted-foreground">
                {cashConfig?.label ?? 'Set cash amount'}
              </Text>
              <View className="flex-row items-center rounded-lg border border-input bg-background px-3 py-3">
                <DollarSign size={18} className="text-muted-foreground" />
                <TextInput
                  value={store.cashAmount}
                  onChangeText={store.setCashAmount}
                  keyboardType="decimal-pad"
                  placeholder={cashConfig?.placeholder ?? '0.00'}
                  className="flex-1 text-lg text-foreground"
                  placeholderTextColor="#a1a1aa"
                />
              </View>
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
            type={store.type!}
            selectedCards={store.selectedCards}
            cashAmount={store.cashAmount}
            description={store.description || null}
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
        {store.step === TOTAL_STEPS && store.type ? (
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
