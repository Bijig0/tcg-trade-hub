import { Linking, Platform } from 'react-native';

type NavigationParams = {
  latitude: number;
  longitude: number;
  label?: string;
};

/**
 * Opens the native maps app for turn-by-turn navigation to a destination.
 *
 * - iOS: Apple Maps first, then Google Maps app, then browser fallback
 * - Android: Google Maps navigation intent, then browser fallback
 */
const openMapsNavigation = async ({
  latitude,
  longitude,
  label,
}: NavigationParams): Promise<void> => {
  const encodedLabel = label ? encodeURIComponent(label) : '';

  if (Platform.OS === 'ios') {
    // Try Apple Maps first
    const appleMapsUrl = `maps://app?daddr=${latitude},${longitude}&dirflg=d${encodedLabel ? `&q=${encodedLabel}` : ''}`;
    const canOpenAppleMaps = await Linking.canOpenURL(appleMapsUrl);
    if (canOpenAppleMaps) {
      await Linking.openURL(appleMapsUrl);
      return;
    }

    // Fallback to Google Maps app
    const googleMapsAppUrl = `comgooglemaps://?daddr=${latitude},${longitude}&directionsmode=driving`;
    const canOpenGoogleMaps = await Linking.canOpenURL(googleMapsAppUrl);
    if (canOpenGoogleMaps) {
      await Linking.openURL(googleMapsAppUrl);
      return;
    }
  }

  if (Platform.OS === 'android') {
    // Google Maps navigation intent
    const googleMapsIntent = `google.navigation:q=${latitude},${longitude}`;
    const canOpenIntent = await Linking.canOpenURL(googleMapsIntent);
    if (canOpenIntent) {
      await Linking.openURL(googleMapsIntent);
      return;
    }
  }

  // Universal browser fallback
  const browserUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
  await Linking.openURL(browserUrl);
};

export default openMapsNavigation;
