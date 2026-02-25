import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { Wrench } from 'lucide-react-native';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthProvider';
import { listingKeys } from '../../queryKeys';
import { DEV_USERS } from '@/config/devUsers';

type DevListingActionsProps = {
  listingId: string;
};

/**
 * Dev-only toolbar for simulating offers from other test users on this listing.
 */
const DevListingActions = ({ listingId }: DevListingActionsProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [otherUserId, setOtherUserId] = useState<string | null>(null);

  if (!__DEV__) return null;

  // Find a test user that isn't the current user
  useEffect(() => {
    const findOther = async () => {
      const otherEmail = DEV_USERS.find((u) => u.email !== user?.email)?.email;
      if (!otherEmail) return;
      const { data } = await supabase
        .from('users')
        .select('id')
        .eq('email', otherEmail)
        .single();
      if (data) setOtherUserId(data.id);
    };
    findOther();
  }, [user?.email]);

  const addFakeOffer = useCallback(async () => {
    if (!otherUserId) return;
    setBusy(true);
    try {
      const { data: offer, error: offerErr } = await supabase
        .from('offers')
        .insert({
          listing_id: listingId,
          offerer_id: otherUserId,
          cash_amount: 15,
          message: 'Dev test offer - great cards!',
          status: 'pending',
        })
        .select()
        .single();

      if (offerErr || !offer) {
        console.warn('[DevListingActions] offer insert:', offerErr?.message);
        return;
      }

      const { error: itemErr } = await supabase.from('offer_items').insert([
        {
          offer_id: offer.id,
          card_name: 'Charizard VMAX',
          card_image_url: 'https://images.pokemontcg.io/swsh35/36_hires.png',
          card_external_id: 'swsh35-36',
          tcg: 'pokemon',
          card_set: "Champion's Path",
          card_number: '036/073',
          condition: 'nm',
          market_price: 45.0,
          quantity: 1,
        },
        {
          offer_id: offer.id,
          card_name: 'Umbreon VMAX',
          card_image_url: 'https://images.pokemontcg.io/swsh7/215_hires.png',
          card_external_id: 'swsh7-215',
          tcg: 'pokemon',
          card_set: 'Evolving Skies',
          card_number: '215/203',
          condition: 'lp',
          market_price: 85.0,
          quantity: 1,
        },
      ]);

      if (itemErr) console.warn('[DevListingActions] items insert:', itemErr.message);

      queryClient.invalidateQueries({ queryKey: listingKeys.offers(listingId) });
      queryClient.invalidateQueries({ queryKey: listingKeys.myListings() });
    } finally {
      setBusy(false);
    }
  }, [listingId, otherUserId, queryClient]);

  if (!otherUserId) return null;

  return (
    <View className="mx-4 mb-2 rounded-lg border border-purple-500/30 bg-purple-500/10 px-3 py-2">
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
          <Pressable
            onPress={addFakeOffer}
            disabled={busy}
            className="rounded-md border border-border bg-card px-3 py-1.5 active:opacity-70"
          >
            {busy ? (
              <ActivityIndicator size="small" />
            ) : (
              <Text className="text-xs font-semibold text-amber-500">+ Fake Offer</Text>
            )}
          </Pressable>
        </View>
      )}
    </View>
  );
};

export default DevListingActions;
