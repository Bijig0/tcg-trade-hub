import React, { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthProvider';
import { cn } from '@/lib/cn';

const TEST_USERS = [
  { email: 'alice@test.dev', password: 'testtest123', name: 'Alice (Pokemon Pro)', tcgs: 'pokemon, mtg' },
  { email: 'bob@test.dev', password: 'testtest123', name: 'Bob (MTG Collector)', tcgs: 'mtg' },
  { email: 'charlie@test.dev', password: 'testtest123', name: 'Charlie (One Piece Fan)', tcgs: 'onepiece, pokemon' },
] as const;

/**
 * Dev-only component that allows quick switching between test user accounts.
 * Only renders when `__DEV__` is true.
 */
const DevUserSwitcher = () => {
  const { user } = useAuth();
  const [switchingEmail, setSwitchingEmail] = useState<string | null>(null);

  if (!__DEV__) return null;

  const handleSwitch = async (email: string, password: string) => {
    if (email === user?.email) return;
    setSwitchingEmail(email);
    try {
      await supabase.auth.signInWithPassword({ email, password });
    } finally {
      setSwitchingEmail(null);
    }
  };

  return (
    <View className="gap-2">
      {TEST_USERS.map(({ email, password, name, tcgs }) => {
        const isActive = user?.email === email;
        const isSwitching = switchingEmail === email;

        return (
          <Pressable
            key={email}
            onPress={() => handleSwitch(email, password)}
            disabled={isActive || switchingEmail !== null}
            className={cn(
              'flex-row items-center justify-between rounded-lg border p-3',
              isActive
                ? 'border-primary bg-primary/10'
                : 'border-border bg-card active:bg-accent',
              switchingEmail !== null && !isSwitching && 'opacity-50',
            )}
          >
            <View>
              <Text className={cn('text-sm font-medium', isActive ? 'text-primary' : 'text-foreground')}>
                {name}
              </Text>
              <Text className="text-xs text-muted-foreground">{email}</Text>
              <Text className="text-xs text-muted-foreground">TCGs: {tcgs}</Text>
            </View>
            {isSwitching ? (
              <ActivityIndicator size="small" />
            ) : isActive ? (
              <Text className="text-xs font-semibold text-primary">Active</Text>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
};

export default DevUserSwitcher;
