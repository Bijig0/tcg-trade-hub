import { useEffect } from 'react';
// @ts-expect-error expo-notifications not installed yet
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthProvider';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Registers the device's Expo push token with the backend.
 * Stores the token in the users table for push notification delivery.
 */
const useRegisterPushToken = () => {
  const { user } = useAuth();

  useEffect(() => {
    const registerToken = async () => {
      if (!user) return;

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') return;

      const tokenData = await Notifications.getExpoPushTokenAsync();
      const token = tokenData.data;

      await supabase
        .from('users')
        .update({ expo_push_token: token })
        .eq('id', user.id);

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
        });
      }
    };

    registerToken();
  }, [user]);
};

export default useRegisterPushToken;
