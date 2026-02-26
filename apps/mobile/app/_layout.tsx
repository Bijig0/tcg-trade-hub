import 'expo-crypto';
import '../src/global.css';
import '@/lib/iconInterop';
import '@/lib/imageInterop';

import React from 'react';
import { Slot, useRouter, useSegments, ErrorBoundary } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ActivityIndicator, View, Text, ScrollView, LogBox } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { queryClient } from '@/lib/queryClient';
import { AuthProvider, useAuth } from '@/context/AuthProvider';
import { ThemeProvider } from '@/context/ThemeProvider';
import ErrorToast from '@/components/ui/ErrorToast/ErrorToast';

// Log all errors to console with full stack traces
const originalConsoleError = console.error;
console.error = (...args: unknown[]) => {
  originalConsoleError(...args);
};

if (__DEV__) {
  // Show full error details instead of alert dialogs
  LogBox.ignoreAllLogs(false);

  const originalHandler = ErrorUtils.getGlobalHandler();
  ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
    console.error(
      `[${isFatal ? 'FATAL' : 'ERROR'}] ${error.message}\n${error.stack}`,
    );
    if (originalHandler) {
      originalHandler(error, isFatal);
    }
  });
}

export { ErrorBoundary };

const RootNavigator = () => {
  const { session, isLoading, isOnboarded } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  React.useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboardingGroup = segments[0] === '(onboarding)';

    if (!session) {
      if (!inAuthGroup) {
        router.replace('/(auth)/login');
      }
    } else if (!isOnboarded) {
      if (!inOnboardingGroup) {
        router.replace('/(onboarding)/location');
      }
    } else {
      if (inAuthGroup || inOnboardingGroup) {
        router.replace('/(tabs)/(listings)');
      }
    }
  }, [session, isLoading, isOnboarded, segments]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Slot />;
};

const RootLayout = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SafeAreaProvider>
            <ThemeProvider>
              <RootNavigator />
              <ErrorToast />
            </ThemeProvider>
          </SafeAreaProvider>
        </AuthProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
};

export default RootLayout;
