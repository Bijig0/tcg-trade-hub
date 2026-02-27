import { useEffect, useRef } from 'react';

const POLL_INTERVAL_MS = 10_000;

/**
 * Polls for OTA updates and auto-reloads the app when one is found.
 * Designed for live development: Claude pushes an EAS update via a stop hook,
 * and this hook picks it up within seconds and seamlessly reloads.
 *
 * Only active in non-dev mode (i.e., preview/production builds not connected to Metro).
 */
const useAutoUpdate = () => {
  const checking = useRef(false);

  useEffect(() => {
    if (__DEV__) return;

    let Updates: typeof import('expo-updates') | null = null;
    try {
      Updates = require('expo-updates') as typeof import('expo-updates');
    } catch {
      return;
    }

    const poll = async () => {
      if (checking.current || !Updates) return;
      checking.current = true;

      try {
        const result = await Updates.checkForUpdateAsync();
        if (!result.isAvailable) {
          checking.current = false;
          return;
        }

        console.log('[AutoUpdate] Update found, downloading...');
        await Updates.fetchUpdateAsync();
        console.log('[AutoUpdate] Downloaded, reloading...');
        await Updates.reloadAsync();
      } catch (error) {
        // Silent fail — will retry on next poll
        console.warn('[AutoUpdate] Check failed:', error);
        checking.current = false;
      }
    };

    // Initial check after a short delay
    const initialTimeout = setTimeout(poll, 3_000);
    // Then poll on interval
    const interval = setInterval(poll, POLL_INTERVAL_MS);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);
};

export default useAutoUpdate;
