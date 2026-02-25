import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
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
import TradeWantsStep from '../TradeWantsStep/TradeWantsStep';

const STEP_LABELS_DEFAULT: Record<number, string> = {
  1: 'Listing Type',
  2: 'Select Cards',
  3: 'Set Price',
  4: 'Review',
};

const STEP_LABELS_WTT: Record<number, string> = {
  1: 'Listing Type',
  2: 'Select Cards',
  3: 'Looking For',
  4: 'Cash & Details',
  5: 'Review',
};

const CASH_LABELS: Record<string, { label: string; placeholder: string }> = {
  wtb: { label: 'What\'s your budget?', placeholder: 'Enter budget amount' },
  wtt: { label: 'Add cash sweetener? (optional)', placeholder: 'Enter amount (or leave at 0)' },
};

/**
 * Unified create listing flow for all types (WTS, WTB, WTT).
 *
 * WTS/WTB: 4 steps — Type → Cards → Pricing → Review
 * WTT: 5 steps — Type → Cards → Trade Wants → Cash/Description → Review
 */
const CreateListingFlow = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ type?: string }>();
  const store = useListingFormStore();
  const createBundleListing = useCreateBundleListing();
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    const validTypes = ['wts', 'wtb', 'wtt'];
    if (params.type && validTypes.includes(params.type) && store.step === 1 && !store.type) {
      store.setType(params.type as 'wts' | 'wtb' | 'wtt');
      store.setStep(2);
    }
  }, []);

  const isWtt = store.type === 'wtt';
  const totalSteps = isWtt ? 5 : 4;
  const stepLabels = isWtt ? STEP_LABELS_WTT : STEP_LABELS_DEFAULT;

  const canProceed = (): boolean => {
    if (store.step === 1) return store.type !== null;

    if (isWtt) {
      switch (store.step) {
        case 2: return store.selectedCards.length > 0;
        case 3: return true; // Trade wants are optional but encouraged
        case 4: return true; // Cash is optional
        case 5: return true;
        default: return false;
      }
    }

    switch (store.step) {
      case 2: return store.selectedCards.length > 0;
      case 3:
        if (store.type === 'wts') {
          return store.selectedCards.every((sc) => sc.askingPrice.length > 0);
        }
        return true;
      case 4: return true;
      default: return false;
    }
  };

  const handleNext = () => {
    if (store.step < totalSteps) {
      store.setStep(store.step + 1);
    }
  };

  const handleBack = () => {
    if (store.step > 1) {
      if (store.step === 2 && params.type) {
        // Came from empty state with pre-selected type — go back to listings
        store.reset();
        router.back();
      } else if (store.step === 2) {
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
        tradeWants: store.tradeWants,
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

    if (store.step === 2) {
      return (
        <MultiCardSelector
          selectedCards={store.selectedCards}
          onToggle={store.toggleSelectedCard}
        />
      );
    }

    if (isWtt) {
      switch (store.step) {
        case 3:
          return (
            <TradeWantsStep
              tradeWants={store.tradeWants}
              onAdd={store.addTradeWant}
              onRemove={store.removeTradeWant}
            />
          );
        case 4: {
          const cashConfig = CASH_LABELS.wtt;
          return (
            <View className="gap-4">
              <Text className="text-base text-muted-foreground">
                {cashConfig.label}
              </Text>
              <View className="flex-row items-center rounded-lg border border-input bg-background px-3 py-3">
                <DollarSign size={18} className="text-muted-foreground" />
                <TextInput
                  value={store.cashAmount}
                  onChangeText={store.setCashAmount}
                  keyboardType="decimal-pad"
                  placeholder={cashConfig.placeholder}
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
        case 5:
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
    }

    // WTS / WTB flow
    switch (store.step) {
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
        {
          const cashConfig = CASH_LABELS[store.type ?? 'wtb'] ?? { label: 'Set cash amount', placeholder: '0.00' };
          return (
            <View className="gap-4">
              <Text className="text-base text-muted-foreground">
                {cashConfig.label}
              </Text>
              <View className="flex-row items-center rounded-lg border border-input bg-background px-3 py-3">
                <DollarSign size={18} className="text-muted-foreground" />
                <TextInput
                  value={store.cashAmount}
                  onChangeText={store.setCashAmount}
                  keyboardType="decimal-pad"
                  placeholder={cashConfig.placeholder}
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
            {stepLabels[store.step] ?? ''}
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
