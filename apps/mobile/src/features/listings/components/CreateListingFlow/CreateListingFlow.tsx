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
  const createBundleListing = useCreateBundleListing();
  const [isPublishing, setIsPublishing] = useState(false);

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
