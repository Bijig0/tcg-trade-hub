import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { Wrench } from 'lucide-react-native';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { meetupKeys } from '../../queryKeys';

type DevMeetupActionsProps = {
  meetupId: string;
  /** Which completion column to toggle for the "other" user */
  otherCompletionField: 'user_a_completed' | 'user_b_completed';
};

/**
 * Dev-only toolbar for simulating meetup state changes from the other user's perspective.
 */
const DevMeetupActions = ({ meetupId, otherCompletionField }: DevMeetupActionsProps) => {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  if (!__DEV__) return null;

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: meetupKeys.detail(meetupId) });
    queryClient.invalidateQueries({ queryKey: meetupKeys.all });
  };

  const otherCompletes = useCallback(async () => {
    setBusy('complete');
    try {
      const { error } = await supabase
        .from('meetups')
        .update({ [otherCompletionField]: true })
        .eq('id', meetupId);
      if (error) console.warn('[DevMeetupActions]', error.message);
      else invalidate();
    } finally {
      setBusy(null);
    }
  }, [meetupId, otherCompletionField]);

  const otherCancels = useCallback(async () => {
    setBusy('cancel');
    try {
      const { error } = await supabase
        .from('meetups')
        .update({ status: 'cancelled' })
        .eq('id', meetupId);
      if (error) console.warn('[DevMeetupActions]', error.message);
      else invalidate();
    } finally {
      setBusy(null);
    }
  }, [meetupId]);

  const actions = [
    { label: 'Other Completes', key: 'complete', onPress: otherCompletes, color: '#10b981' },
    { label: 'Other Cancels', key: 'cancel', onPress: otherCancels, color: '#ef4444' },
  ];

  return (
    <View className="mx-4 mt-4 rounded-lg border border-purple-500/30 bg-purple-500/10 px-3 py-2">
      <Pressable
        onPress={() => setExpanded((e) => !e)}
        className="flex-row items-center gap-1.5"
      >
        <Wrench size={12} color="#a855f7" />
        <Text className="text-xs font-medium text-purple-400">
          Dev Actions {expanded ? '▾' : '▸'}
        </Text>
      </Pressable>

      {expanded && (
        <View className="mt-2 flex-row gap-2">
          {actions.map(({ label, key, onPress, color }) => (
            <Pressable
              key={key}
              onPress={onPress}
              disabled={busy !== null}
              className="rounded-md border border-border bg-card px-3 py-1.5 active:opacity-70"
            >
              {busy === key ? (
                <ActivityIndicator size="small" />
              ) : (
                <Text style={{ color }} className="text-xs font-semibold">
                  {label}
                </Text>
              )}
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
};

export default DevMeetupActions;
