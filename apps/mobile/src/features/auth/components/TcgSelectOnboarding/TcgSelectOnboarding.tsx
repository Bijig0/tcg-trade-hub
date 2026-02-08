import React, { useState } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthProvider';
import useUpdateProfile from '@/features/profile/hooks/useUpdateProfile/useUpdateProfile';
import Button from '@/components/ui/Button/Button';
import type { TcgType } from '@tcg-trade-hub/database';

type TcgOption = {
  value: TcgType;
  label: string;
  emoji: string;
};

const TCG_OPTIONS: TcgOption[] = [
  { value: 'pokemon', label: 'Pokemon', emoji: '\u26A1' },
  { value: 'mtg', label: 'Magic: The Gathering', emoji: '\u2728' },
  { value: 'yugioh', label: 'Yu-Gi-Oh!', emoji: '\uD83C\uDFAD' },
];

const TcgSelectOnboarding = () => {
  const router = useRouter();
  const { refreshProfile } = useAuth();
  const updateProfile = useUpdateProfile();
  const [selected, setSelected] = useState<TcgType[]>([]);

  const toggleTcg = (tcg: TcgType) => {
    setSelected((prev) =>
      prev.includes(tcg) ? prev.filter((t) => t !== tcg) : [...prev, tcg],
    );
  };

  const handleContinue = () => {
    if (selected.length === 0) {
      Alert.alert('Selection required', 'Please select at least one TCG to continue.');
      return;
    }

    updateProfile.mutate(
      { preferred_tcgs: selected },
      {
        onSuccess: async () => {
          await refreshProfile();
          router.push('/(onboarding)/collection-import');
        },
        onError: (err) => {
          Alert.alert('Error', err.message ?? 'Failed to save preferences');
        },
      },
    );
  };

  return (
    <View className="flex-1 bg-background px-6 pt-16">
      <View className="mb-8">
        <Text className="text-3xl font-bold text-foreground">What do you play?</Text>
        <Text className="mt-2 text-base text-muted-foreground">
          Select the trading card games you are interested in. You can change this later.
        </Text>
      </View>

      <View className="gap-3">
        {TCG_OPTIONS.map((option) => {
          const isSelected = selected.includes(option.value);

          return (
            <Pressable
              key={option.value}
              onPress={() => toggleTcg(option.value)}
              className={`flex-row items-center rounded-xl border-2 p-5 ${
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card'
              }`}
            >
              <Text className="text-3xl">{option.emoji}</Text>
              <View className="ml-4 flex-1">
                <Text className="text-lg font-semibold text-foreground">
                  {option.label}
                </Text>
              </View>
              <View
                className={`h-6 w-6 items-center justify-center rounded-full border-2 ${
                  isSelected ? 'border-primary bg-primary' : 'border-muted-foreground'
                }`}
              >
                {isSelected && (
                  <Text className="text-xs font-bold text-primary-foreground">
                    {'\u2713'}
                  </Text>
                )}
              </View>
            </Pressable>
          );
        })}
      </View>

      <View className="mt-auto pb-12">
        <Button
          size="lg"
          onPress={handleContinue}
          disabled={selected.length === 0 || updateProfile.isPending}
          className="w-full"
        >
          <Text className="text-base font-semibold text-primary-foreground">
            {updateProfile.isPending ? 'Saving...' : 'Continue'}
          </Text>
        </Button>
      </View>
    </View>
  );
};

export default TcgSelectOnboarding;
