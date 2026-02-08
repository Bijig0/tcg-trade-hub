import React, { useState, useEffect } from 'react';
import { View, Text, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthProvider';
import Button from '@/components/ui/Button/Button';
import Input from '@/components/ui/Input/Input';
import Slider from '@/components/ui/Slider/Slider';

type LocationState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'granted'; city: string; coords: { latitude: number; longitude: number } }
  | { status: 'denied' };

const LocationOnboarding = () => {
  const router = useRouter();
  const { user, refreshProfile } = useAuth();
  const [locationState, setLocationState] = useState<LocationState>({ status: 'idle' });
  const [manualAddress, setManualAddress] = useState('');
  const [radiusKm, setRadiusKm] = useState(25);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const requestLocation = async () => {
      setLocationState({ status: 'loading' });

      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setLocationState({ status: 'denied' });
        return;
      }

      try {
        const position = await Location.getCurrentPositionAsync({});
        const [geocode] = await Location.reverseGeocodeAsync({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });

        const city = geocode?.city ?? geocode?.subregion ?? 'Unknown location';

        setLocationState({
          status: 'granted',
          city,
          coords: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
        });
      } catch {
        setLocationState({ status: 'denied' });
      }
    };

    requestLocation();
  }, []);

  const canContinue =
    locationState.status === 'granted' ||
    (locationState.status === 'denied' && manualAddress.trim().length > 0);

  const handleContinue = async () => {
    if (!user || !canContinue) return;

    setIsSaving(true);

    try {
      const updatePayload: Record<string, unknown> = { radius_km: radiusKm };

      if (locationState.status === 'granted') {
        updatePayload.location = `POINT(${locationState.coords.longitude} ${locationState.coords.latitude})`;
      }

      const { error } = await supabase
        .from('users')
        .upsert({ id: user.id, email: user.email!, display_name: user.email!.split('@')[0], ...updatePayload });

      if (error) throw error;

      await refreshProfile();
      router.push('/(onboarding)/tcg-select');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save location';
      Alert.alert('Error', message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View className="flex-1 bg-background px-6 pt-16">
      <View className="mb-8">
        <Text className="text-3xl font-bold text-foreground">Set your location</Text>
        <Text className="mt-2 text-base text-muted-foreground">
          We use your location to find nearby traders and card shops.
        </Text>
      </View>

      {locationState.status === 'loading' && (
        <View className="items-center py-12">
          <ActivityIndicator size="large" />
          <Text className="mt-4 text-base text-muted-foreground">
            Getting your location...
          </Text>
        </View>
      )}

      {locationState.status === 'granted' && (
        <View className="mb-6 rounded-xl border border-border bg-card p-4">
          <Text className="text-sm font-medium text-muted-foreground">Detected location</Text>
          <Text className="mt-1 text-xl font-semibold text-foreground">
            {locationState.city}
          </Text>
        </View>
      )}

      {locationState.status === 'denied' && (
        <View className="mb-6 gap-3">
          <Text className="text-sm text-muted-foreground">
            Location permission was denied. Enter your city or address manually.
          </Text>
          <Input
            label="Your city or address"
            placeholder="e.g. Melbourne, VIC"
            value={manualAddress}
            onChangeText={setManualAddress}
            autoCapitalize="words"
          />
        </View>
      )}

      {(locationState.status === 'granted' || locationState.status === 'denied') && (
        <View className="mb-8">
          <Slider
            label="Search radius"
            value={radiusKm}
            onValueChange={setRadiusKm}
            min={5}
            max={100}
            step={5}
            showValue
          />
          <Text className="mt-1 text-sm text-muted-foreground">{radiusKm} km</Text>
        </View>
      )}

      <View className="mt-auto pb-12">
        <Button
          size="lg"
          onPress={handleContinue}
          disabled={!canContinue || isSaving}
          className="w-full"
        >
          <Text className="text-base font-semibold text-primary-foreground">
            {isSaving ? 'Saving...' : 'Continue'}
          </Text>
        </Button>
      </View>
    </View>
  );
};

export default LocationOnboarding;
