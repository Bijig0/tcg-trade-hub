import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

const getStorybookUI = (): React.ComponentType | null => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('../../../.rnstorybook').default;
  } catch {
    return null;
  }
};

const StorybookScreen = () => {
  const router = useRouter();

  if (!__DEV__) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <Text className="text-foreground">Storybook is only available in development.</Text>
      </SafeAreaView>
    );
  }

  const StorybookUI = getStorybookUI();

  if (!StorybookUI) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        <View className="flex-row items-center border-b border-border px-4 py-3">
          <Pressable onPress={() => router.back()} className="mr-3 p-1">
            <ArrowLeft size={24} className="text-foreground" />
          </Pressable>
          <Text className="text-lg font-semibold text-foreground">Storybook</Text>
        </View>
        <View className="flex-1 items-center justify-center p-4">
          <Text className="text-center text-foreground">
            Storybook is not enabled. Restart with:
          </Text>
          <Text className="mt-2 text-sm text-muted-foreground">
            pnpm --dir apps/mobile storybook
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-row items-center border-b border-border px-4 py-3">
        <Pressable onPress={() => router.back()} className="mr-3 p-1">
          <ArrowLeft size={24} className="text-foreground" />
        </Pressable>
        <Text className="text-lg font-semibold text-foreground">Storybook</Text>
      </View>
      <View className="flex-1">
        <StorybookUI />
      </View>
    </SafeAreaView>
  );
};

export default StorybookScreen;
