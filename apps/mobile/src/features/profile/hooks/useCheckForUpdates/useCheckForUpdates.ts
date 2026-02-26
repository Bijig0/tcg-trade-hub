import { useState, useCallback } from 'react';
import { Alert } from 'react-native';

type UpdateStatus = 'idle' | 'checking' | 'downloading' | 'ready' | 'up-to-date' | 'error';

type UseCheckForUpdatesReturn = {
  status: UpdateStatus;
  checkForUpdates: () => Promise<void>;
};

/**
 * Lazily loads expo-updates. Returns null in Expo Go where the module
 * is not available (it requires a development or production build).
 */
const getUpdatesModule = () => {
  try {
    return require('expo-updates') as typeof import('expo-updates');
  } catch {
    return null;
  }
};

/**
 * Hook to check for and apply OTA updates via expo-updates.
 *
 * In Expo Go the module is unavailable, so tapping shows an info alert.
 * In production builds it checks, downloads, and prompts for restart.
 */
const useCheckForUpdates = (): UseCheckForUpdatesReturn => {
  const [status, setStatus] = useState<UpdateStatus>('idle');

  const checkForUpdates = useCallback(async () => {
    const Updates = getUpdatesModule();

    if (!Updates || __DEV__) {
      Alert.alert(
        'Development Mode',
        'OTA updates are not available in development. Build a production version to test updates.',
      );
      return;
    }

    try {
      setStatus('checking');
      const update = await Updates.checkForUpdateAsync();

      if (!update.isAvailable) {
        setStatus('up-to-date');
        Alert.alert('Up to Date', 'You are running the latest version.');
        return;
      }

      setStatus('downloading');
      await Updates.fetchUpdateAsync();
      setStatus('ready');

      Alert.alert(
        'Update Available',
        'A new version has been downloaded. Restart the app to apply it.',
        [
          { text: 'Later', style: 'cancel', onPress: () => setStatus('idle') },
          {
            text: 'Restart Now',
            onPress: async () => {
              await Updates.reloadAsync();
            },
          },
        ],
      );
    } catch (error) {
      setStatus('error');
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      Alert.alert('Update Error', `Failed to check for updates: ${message}`);
    }
  }, []);

  return { status, checkForUpdates };
};

export default useCheckForUpdates;
