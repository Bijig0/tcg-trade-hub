import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { Wrench } from 'lucide-react-native';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { chatKeys } from '../../queryKeys';

type DevChatActionsProps = {
  conversationId: string;
  otherUserId: string;
  matchId: string;
};

/**
 * Dev-only toolbar for simulating the other user's chat actions.
 * Inserts messages directly into Supabase as the other user.
 */
const DevChatActions = ({ conversationId, otherUserId }: DevChatActionsProps) => {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  if (!__DEV__) return null;

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: chatKeys.messages(conversationId) });
    queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
  };

  const insertMessage = useCallback(
    async (label: string, data: Record<string, unknown>) => {
      setBusy(label);
      try {
        const { error } = await supabase.from('messages').insert({
          conversation_id: conversationId,
          sender_id: otherUserId,
          ...data,
        });
        if (error) console.warn('[DevChatActions]', error.message);
        else invalidate();
      } finally {
        setBusy(null);
      }
    },
    [conversationId, otherUserId],
  );

  const sendText = () =>
    insertMessage('Text', {
      type: 'text',
      body: 'Hey! Interested in trading. (dev message)',
      payload: null,
    });

  const sendOffer = () =>
    insertMessage('Offer', {
      type: 'card_offer',
      body: null,
      payload: {
        offering: [
          {
            card_name: 'Charizard VMAX',
            card_image_url: 'https://images.pokemontcg.io/swsh35/36_hires.png',
            card_external_id: 'swsh35-36',
            tcg: 'pokemon',
            card_set: 'Champion\'s Path',
            card_number: '036/073',
            condition: 'nm',
            market_price: 45.0,
            quantity: 1,
          },
        ],
        requesting: [
          {
            card_name: 'Pikachu V',
            card_image_url: 'https://images.pokemontcg.io/swsh4/43_hires.png',
            card_external_id: 'swsh4-43',
            tcg: 'pokemon',
            card_set: 'Vivid Voltage',
            card_number: '043/185',
            condition: 'nm',
            market_price: 8.0,
            quantity: 1,
          },
        ],
        cash_amount: 5,
        cash_direction: 'requesting',
        note: 'Dev test offer',
      },
    });

  const sendMeetup = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(14, 0, 0, 0);

    return insertMessage('Meetup', {
      type: 'meetup_proposal',
      body: null,
      payload: {
        location_name: 'Cherry Collectables Melbourne CBD',
        location_coords: { lat: -37.8136, lng: 144.9631 },
        proposed_time: tomorrow.toISOString(),
        note: 'Dev test meetup proposal',
      },
    });
  };

  const actions = [
    { label: 'Text', onPress: sendText, color: '#6b7280' },
    { label: 'Offer', onPress: sendOffer, color: '#f59e0b' },
    { label: 'Meetup', onPress: sendMeetup, color: '#10b981' },
  ];

  return (
    <View className="border-t border-border bg-card/50 px-4 py-1.5">
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
        <View className="mt-1.5 flex-row gap-2">
          {actions.map(({ label, onPress, color }) => (
            <Pressable
              key={label}
              onPress={onPress}
              disabled={busy !== null}
              className="rounded-md border border-border bg-card px-3 py-1.5 active:opacity-70"
            >
              {busy === label ? (
                <ActivityIndicator size="small" />
              ) : (
                <Text style={{ color }} className="text-xs font-semibold">
                  + {label}
                </Text>
              )}
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
};

export default DevChatActions;
