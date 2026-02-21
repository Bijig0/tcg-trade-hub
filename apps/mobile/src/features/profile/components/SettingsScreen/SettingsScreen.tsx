import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Switch, Pressable, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthProvider';
import { supabase } from '@/lib/supabase';
import Button from '@/components/ui/Button/Button';
import Separator from '@/components/ui/Separator/Separator';
import Slider from '@/components/ui/Slider/Slider';
import { cn } from '@/lib/cn';
import { TCG_LABELS, MIN_RADIUS_KM, MAX_RADIUS_KM } from '@/config/constants';
import useUpdateProfile from '../../hooks/useUpdateProfile/useUpdateProfile';
import DevUserSwitcher from '../DevUserSwitcher/DevUserSwitcher';
import type { TcgType } from '@tcg-trade-hub/database';

const ALL_TCGS: TcgType[] = ['pokemon', 'mtg', 'yugioh'];

type NotificationPrefs = {
  new_matches: boolean;
  messages: boolean;
  meetup_reminders: boolean;
  offers: boolean;
};

/**
 * Settings screen with Account, Preferences, Privacy & Safety, and About sections.
 */
const SettingsScreen = () => {
  const router = useRouter();
  const { profile, user, signOut } = useAuth();
  const updateProfile = useUpdateProfile();
  const [radiusKm, setRadiusKm] = useState(profile?.radius_km ?? 25);
  const [selectedTcgs, setSelectedTcgs] = useState<TcgType[]>(profile?.preferred_tcgs ?? []);
  const [showApproxDistance, setShowApproxDistance] = useState(true);
  const [notifications, setNotifications] = useState<NotificationPrefs>({
    new_matches: true,
    messages: true,
    meetup_reminders: true,
    offers: true,
  });

  useEffect(() => {
    if (profile) {
      setRadiusKm(profile.radius_km);
      setSelectedTcgs([...profile.preferred_tcgs]);
    }
  }, [profile]);

  const toggleTcg = (tcg: TcgType) => {
    const updated = selectedTcgs.includes(tcg)
      ? selectedTcgs.filter((t) => t !== tcg)
      : [...selectedTcgs, tcg];
    setSelectedTcgs(updated);
    updateProfile.mutate({ preferred_tcgs: updated });
  };

  const handleRadiusChange = (value: number) => {
    setRadiusKm(value);
  };

  const handleRadiusSave = () => {
    updateProfile.mutate({ radius_km: radiusKm });
  };

  const toggleNotification = (key: keyof NotificationPrefs) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
    // In production, this would persist to the backend
  };

  const handleChangePassword = () => {
    Alert.alert(
      'Change Password',
      'We will send a password reset link to your email.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Link',
          onPress: async () => {
            if (!user?.email) return;
            const { error } = await supabase.auth.resetPasswordForEmail(user.email);
            if (error) {
              Alert.alert('Error', error.message);
            } else {
              Alert.alert('Success', 'Password reset email sent.');
            }
          },
        },
      ],
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action is permanent and cannot be undone. All your data will be deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            // Soft delete via edge function in production
            const { error } = await supabase.functions.invoke('delete-account');
            if (error) {
              Alert.alert('Error', error.message);
            } else {
              await signOut();
            }
          },
        },
      ],
    );
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', onPress: signOut },
    ]);
  };

  const isEmailAuth = user?.app_metadata?.provider === 'email';

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
    <ScrollView className="flex-1" contentContainerClassName="pb-12">
      {/* Account Section */}
      <View className="px-4 pt-6">
        <Text className="mb-3 text-lg font-bold text-foreground">Account</Text>

        <View className="gap-3">
          <View className="flex-row items-center justify-between rounded-lg border border-border bg-card p-3">
            <Text className="text-sm text-muted-foreground">Email</Text>
            <Text className="text-sm text-foreground">{user?.email ?? 'N/A'}</Text>
          </View>

          {isEmailAuth ? (
            <Pressable
              onPress={handleChangePassword}
              className="rounded-lg border border-border bg-card p-3 active:bg-accent"
            >
              <Text className="text-sm text-foreground">Change Password</Text>
            </Pressable>
          ) : null}

          <View className="flex-row items-center justify-between rounded-lg border border-border bg-card p-3">
            <Text className="text-sm text-muted-foreground">Auth Provider</Text>
            <Text className="text-sm text-foreground capitalize">
              {user?.app_metadata?.provider ?? 'email'}
            </Text>
          </View>

          <Button variant="destructive" size="sm" onPress={handleDeleteAccount}>
            <Text className="text-sm font-semibold text-destructive-foreground">
              Delete Account
            </Text>
          </Button>
        </View>
      </View>

      <View className="px-4 py-4">
        <Separator />
      </View>

      {/* Preferences Section */}
      <View className="px-4">
        <Text className="mb-3 text-lg font-bold text-foreground">Preferences</Text>

        <View className="gap-4">
          <View>
            <Slider
              label="Search Radius"
              value={radiusKm}
              onValueChange={handleRadiusChange}
              min={MIN_RADIUS_KM}
              max={MAX_RADIUS_KM}
              step={5}
              showValue
            />
            <Pressable onPress={handleRadiusSave}>
              <Text className="mt-1 text-xs text-primary">Save radius</Text>
            </Pressable>
          </View>

          <View>
            <Text className="mb-2 text-sm font-medium text-foreground">Preferred TCGs</Text>
            {ALL_TCGS.map((tcg) => {
              const isSelected = selectedTcgs.includes(tcg);
              return (
                <Pressable
                  key={tcg}
                  onPress={() => toggleTcg(tcg)}
                  className={cn(
                    'mb-2 flex-row items-center rounded-lg border p-3',
                    isSelected ? 'border-primary bg-primary/10' : 'border-border bg-card',
                  )}
                >
                  <View
                    className={cn(
                      'mr-3 h-5 w-5 items-center justify-center rounded border',
                      isSelected ? 'border-primary bg-primary' : 'border-input bg-background',
                    )}
                  >
                    {isSelected ? (
                      <Text className="text-xs font-bold text-primary-foreground">{'\u2713'}</Text>
                    ) : null}
                  </View>
                  <Text className="text-sm text-foreground">{TCG_LABELS[tcg]}</Text>
                </Pressable>
              );
            })}
          </View>

          <View>
            <Text className="mb-2 text-sm font-medium text-foreground">Push Notifications</Text>
            {(
              [
                { key: 'new_matches', label: 'New Matches' },
                { key: 'messages', label: 'Messages' },
                { key: 'meetup_reminders', label: 'Meetup Reminders' },
                { key: 'offers', label: 'Trade Offers' },
              ] as const
            ).map(({ key, label }) => (
              <View
                key={key}
                className="mb-2 flex-row items-center justify-between rounded-lg border border-border bg-card p-3"
              >
                <Text className="text-sm text-foreground">{label}</Text>
                <Switch
                  value={notifications[key]}
                  onValueChange={() => toggleNotification(key)}
                />
              </View>
            ))}
          </View>
        </View>
      </View>

      <View className="px-4 py-4">
        <Separator />
      </View>

      {/* Privacy & Safety Section */}
      <View className="px-4">
        <Text className="mb-3 text-lg font-bold text-foreground">Privacy & Safety</Text>

        <View className="gap-3">
          <Pressable
            onPress={() => router.push('/(tabs)/(profile)/blocked-users')}
            className="rounded-lg border border-border bg-card p-3 active:bg-accent"
          >
            <Text className="text-sm text-foreground">Blocked Users</Text>
          </Pressable>

          <View className="flex-row items-center justify-between rounded-lg border border-border bg-card p-3">
            <Text className="text-sm text-foreground">Show Approximate Distance</Text>
            <Switch
              value={showApproxDistance}
              onValueChange={setShowApproxDistance}
            />
          </View>
        </View>
      </View>

      <View className="px-4 py-4">
        <Separator />
      </View>

      {/* About Section */}
      <View className="px-4">
        <Text className="mb-3 text-lg font-bold text-foreground">About</Text>

        <View className="gap-3">
          <View className="flex-row items-center justify-between rounded-lg border border-border bg-card p-3">
            <Text className="text-sm text-muted-foreground">App Version</Text>
            <Text className="text-sm text-foreground">1.0.0</Text>
          </View>

          <Pressable
            onPress={() => Linking.openURL('https://tcgtradehub.app/terms')}
            className="rounded-lg border border-border bg-card p-3 active:bg-accent"
          >
            <Text className="text-sm text-foreground">Terms of Service</Text>
          </Pressable>

          <Pressable
            onPress={() => Linking.openURL('https://tcgtradehub.app/privacy')}
            className="rounded-lg border border-border bg-card p-3 active:bg-accent"
          >
            <Text className="text-sm text-foreground">Privacy Policy</Text>
          </Pressable>

          <Pressable
            onPress={() => Linking.openURL('mailto:support@tcgtradehub.app')}
            className="rounded-lg border border-border bg-card p-3 active:bg-accent"
          >
            <Text className="text-sm text-foreground">Contact Support</Text>
          </Pressable>
        </View>
      </View>

      <View className="px-4 py-4">
        <Separator />
      </View>

      {/* Developer Tools (dev only) */}
      {__DEV__ && (
        <>
          <View className="px-4">
            <Text className="mb-3 text-lg font-bold text-foreground">Developer Tools</Text>
            <Text className="mb-2 text-xs text-muted-foreground">
              Quick-switch between test accounts
            </Text>
            <DevUserSwitcher />
          </View>

          <View className="px-4 py-4">
            <Separator />
          </View>
        </>
      )}

      {/* Sign out */}
      <View className="px-4">
        <Button variant="outline" onPress={handleSignOut}>
          <Text className="text-base font-medium text-destructive">Sign Out</Text>
        </Button>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsScreen;
