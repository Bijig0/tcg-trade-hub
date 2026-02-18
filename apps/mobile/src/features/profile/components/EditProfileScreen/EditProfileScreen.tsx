import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/context/AuthProvider';
import Avatar from '@/components/ui/Avatar/Avatar';
import Button from '@/components/ui/Button/Button';
import Input from '@/components/ui/Input/Input';
import Slider from '@/components/ui/Slider/Slider';
import { cn } from '@/lib/cn';
import { TCG_LABELS, MIN_RADIUS_KM, MAX_RADIUS_KM } from '@/config/constants';
import useUpdateProfile from '../../hooks/useUpdateProfile/useUpdateProfile';
import type { TcgType } from '@tcg-trade-hub/database';

const ALL_TCGS: TcgType[] = ['pokemon', 'mtg', 'yugioh'];

/**
 * Form screen for editing the current user's profile.
 *
 * Fields: avatar (image picker), display name (text input),
 * search radius (slider 5-100km), preferred TCGs (multi-select).
 */
const EditProfileScreen = () => {
  const router = useRouter();
  const { profile } = useAuth();
  const updateProfile = useUpdateProfile();

  const [displayName, setDisplayName] = useState(profile?.display_name ?? '');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile?.avatar_url ?? null);
  const [radiusKm, setRadiusKm] = useState(profile?.radius_km ?? 25);
  const [selectedTcgs, setSelectedTcgs] = useState<TcgType[]>(profile?.preferred_tcgs ?? []);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name);
      setAvatarUrl(profile.avatar_url);
      setRadiusKm(profile.radius_km);
      setSelectedTcgs([...profile.preferred_tcgs]);
    }
  }, [profile]);

  const initials = displayName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const toggleTcg = (tcg: TcgType) => {
    setSelectedTcgs((prev) =>
      prev.includes(tcg) ? prev.filter((t) => t !== tcg) : [...prev, tcg],
    );
  };

  const handlePickAvatar = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission required', 'Please allow access to your photo library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatarUrl(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    if (!displayName.trim()) {
      Alert.alert('Validation', 'Display name is required.');
      return;
    }

    updateProfile.mutate(
      {
        display_name: displayName.trim(),
        avatar_url: avatarUrl,
        radius_km: radiusKm,
        preferred_tcgs: selectedTcgs,
      },
      {
        onSuccess: () => {
          router.back();
        },
      },
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <ScrollView contentContainerClassName="pb-8" keyboardShouldPersistTaps="handled">
        {/* Avatar picker */}
        <View className="items-center pt-8">
          <Pressable onPress={handlePickAvatar}>
            <Avatar uri={avatarUrl} fallback={initials} size="lg" className="h-24 w-24" />
            <View className="absolute bottom-0 right-0 rounded-full bg-primary px-2 py-1">
              <Text className="text-xs font-semibold text-primary-foreground">Edit</Text>
            </View>
          </Pressable>
        </View>

        {/* Display name */}
        <View className="mt-6 px-6">
          <Input
            label="Display Name"
            placeholder="Your display name"
            value={displayName}
            onChangeText={setDisplayName}
            autoCapitalize="words"
          />
        </View>

        {/* Search radius */}
        <View className="mt-6 px-6">
          <Slider
            label="Search Radius"
            value={radiusKm}
            onValueChange={setRadiusKm}
            min={MIN_RADIUS_KM}
            max={MAX_RADIUS_KM}
            step={5}
            showValue
          />
          <Text className="mt-1 text-xs text-muted-foreground">{radiusKm} km</Text>
        </View>

        {/* Preferred TCGs */}
        <View className="mt-6 px-6">
          <Text className="mb-3 text-sm font-medium text-foreground">Preferred TCGs</Text>
          <View className="gap-3">
            {ALL_TCGS.map((tcg) => {
              const isSelected = selectedTcgs.includes(tcg);
              return (
                <Pressable
                  key={tcg}
                  onPress={() => toggleTcg(tcg)}
                  className={cn(
                    'flex-row items-center rounded-lg border p-3',
                    isSelected ? 'border-primary bg-primary/10' : 'border-border bg-background',
                  )}
                >
                  <View
                    className={cn(
                      'mr-3 h-5 w-5 items-center justify-center rounded border',
                      isSelected ? 'border-primary bg-primary' : 'border-input bg-background',
                    )}
                  >
                    {isSelected ? (
                      <Text className="text-xs font-bold text-primary-foreground">
                        {'\u2713'}
                      </Text>
                    ) : null}
                  </View>
                  <Text className="text-base text-foreground">{TCG_LABELS[tcg]}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Save button */}
        <View className="mt-8 px-6">
          <Button
            size="lg"
            onPress={handleSave}
            disabled={updateProfile.isPending}
          >
            <Text className="text-base font-semibold text-primary-foreground">
              {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
            </Text>
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default EditProfileScreen;
