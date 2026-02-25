import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

type UserLocation = {
  latitude: number;
  longitude: number;
};

/**
 * Thin hook wrapping expo-location for foreground position.
 * Requests permission on mount, caches result in state.
 * Returns null while loading or if permission denied.
 */
const useUserLocation = () => {
  const [location, setLocation] = useState<UserLocation | null>(null);

  useEffect(() => {
    const getLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      try {
        const position = await Location.getCurrentPositionAsync({});
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      } catch {
        // Location unavailable — leave as null
      }
    };

    getLocation();
  }, []);

  return location;
};

export default useUserLocation;
