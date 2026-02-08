import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TextInput,
  Pressable,
  Image,
  FlatList,
  Switch,
} from 'react-native';
import { X, Search, Plus } from 'lucide-react-native';
import { cn } from '@/lib/cn';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthProvider';
import Button from '@/components/ui/Button/Button';
import Input from '@/components/ui/Input/Input';
import useSendMessage from '@/features/chat/hooks/useSendMessage/useSendMessage';
import type { CardRef, CardOfferPayload } from '@tcg-trade-hub/database';

export type OfferModalProps = {
  visible: boolean;
  onClose: () => void;
  conversationId: string;
  otherUserId: string;
  /** Pre-populated data for counter-offers */
  prefillData?: CardOfferPayload | null;
};

type CardPillProps = {
  card: CardRef;
  onRemove: () => void;
};

const CardPill = ({ card, onRemove }: CardPillProps) => (
  <View className="flex-row items-center gap-1.5 rounded-full bg-muted pl-1 pr-2 py-1">
    <Image
      source={{ uri: card.imageUrl }}
      className="h-6 w-5 rounded-sm"
    />
    <Text className="max-w-[100px] text-xs text-foreground" numberOfLines={1}>
      {card.name}
    </Text>
    <Pressable onPress={onRemove} className="ml-0.5">
      <X size={12} color="#6b7280" />
    </Pressable>
  </View>
);

type CardSearchResult = {
  id: string;
  card_name: string;
  image_url: string;
  external_id: string;
  tcg: string;
  condition?: string;
};

/** Modal for creating a trade offer with offering/requesting sections and optional cash */
const OfferModal = ({
  visible,
  onClose,
  conversationId,
  otherUserId,
  prefillData,
}: OfferModalProps) => {
  const { user } = useAuth();
  const sendMessage = useSendMessage();
  const [offering, setOffering] = useState<CardRef[]>([]);
  const [requesting, setRequesting] = useState<CardRef[]>([]);
  const [showCash, setShowCash] = useState(false);
  const [cashAmount, setCashAmount] = useState('');
  const [cashDirection, setCashDirection] = useState<'offering' | 'requesting'>(
    'offering',
  );
  const [note, setNote] = useState('');
  const [offerSearch, setOfferSearch] = useState('');
  const [requestSearch, setRequestSearch] = useState('');
  const [ownCards, setOwnCards] = useState<CardSearchResult[]>([]);
  const [otherCards, setOtherCards] = useState<CardSearchResult[]>([]);

  // Populate with prefill data when opening for counter-offers
  useEffect(() => {
    if (visible && prefillData) {
      setOffering(prefillData.offering);
      setRequesting(prefillData.requesting);
      if (prefillData.cash_amount) {
        setShowCash(true);
        setCashAmount(String(prefillData.cash_amount));
        setCashDirection(prefillData.cash_direction ?? 'offering');
      }
      if (prefillData.note) {
        setNote(prefillData.note);
      }
    }
  }, [visible, prefillData]);

  // Reset state on close
  const handleClose = useCallback(() => {
    setOffering([]);
    setRequesting([]);
    setShowCash(false);
    setCashAmount('');
    setCashDirection('offering');
    setNote('');
    setOfferSearch('');
    setRequestSearch('');
    setOwnCards([]);
    setOtherCards([]);
    onClose();
  }, [onClose]);

  // Search user's own collection
  const searchOwnCollection = useCallback(
    async (query: string) => {
      if (!user || !query.trim()) {
        setOwnCards([]);
        return;
      }
      const { data } = await supabase
        .from('collection_items')
        .select('id, card_name, image_url, external_id, tcg, condition')
        .eq('user_id', user.id)
        .ilike('card_name', `%${query}%`)
        .limit(10);
      setOwnCards((data as CardSearchResult[]) ?? []);
    },
    [user],
  );

  // Search other user's collection
  const searchOtherCollection = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setOtherCards([]);
        return;
      }
      const { data } = await supabase
        .from('collection_items')
        .select('id, card_name, image_url, external_id, tcg, condition')
        .eq('user_id', otherUserId)
        .ilike('card_name', `%${query}%`)
        .limit(10);
      setOtherCards((data as CardSearchResult[]) ?? []);
    },
    [otherUserId],
  );

  useEffect(() => {
    const timeout = setTimeout(() => searchOwnCollection(offerSearch), 300);
    return () => clearTimeout(timeout);
  }, [offerSearch, searchOwnCollection]);

  useEffect(() => {
    const timeout = setTimeout(
      () => searchOtherCollection(requestSearch),
      300,
    );
    return () => clearTimeout(timeout);
  }, [requestSearch, searchOtherCollection]);

  const addToOffering = useCallback((card: CardSearchResult) => {
    const ref: CardRef = {
      externalId: card.external_id,
      tcg: card.tcg,
      name: card.card_name,
      imageUrl: card.image_url,
    };
    setOffering((prev) => [...prev, ref]);
    setOfferSearch('');
    setOwnCards([]);
  }, []);

  const addToRequesting = useCallback((card: CardSearchResult) => {
    const ref: CardRef = {
      externalId: card.external_id,
      tcg: card.tcg,
      name: card.card_name,
      imageUrl: card.image_url,
    };
    setRequesting((prev) => [...prev, ref]);
    setRequestSearch('');
    setOtherCards([]);
  }, []);

  const handleSendOffer = useCallback(() => {
    if (offering.length === 0 || requesting.length === 0) return;

    const payload: CardOfferPayload = {
      offering,
      requesting,
      ...(showCash && cashAmount
        ? {
            cash_amount: parseFloat(cashAmount),
            cash_direction: cashDirection,
          }
        : {}),
      ...(note.trim() ? { note: note.trim() } : {}),
    };

    sendMessage.mutate(
      {
        conversationId,
        type: 'card_offer',
        body: 'Sent a trade offer',
        payload: payload as unknown as Record<string, unknown>,
      },
      {
        onSuccess: handleClose,
      },
    );
  }, [
    offering,
    requesting,
    showCash,
    cashAmount,
    cashDirection,
    note,
    conversationId,
    sendMessage,
    handleClose,
  ]);

  const renderSearchResult = useCallback(
    (
      item: CardSearchResult,
      onAdd: (card: CardSearchResult) => void,
    ) => (
      <Pressable
        key={item.id}
        onPress={() => onAdd(item)}
        className="flex-row items-center gap-2 border-b border-border px-3 py-2 active:bg-accent"
      >
        <Image
          source={{ uri: item.image_url }}
          className="h-10 w-7 rounded"
        />
        <Text className="flex-1 text-sm text-foreground" numberOfLines={1}>
          {item.card_name}
        </Text>
        <Plus size={16} color="#6b7280" />
      </Pressable>
    ),
    [],
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-background">
        {/* Header */}
        <View className="flex-row items-center justify-between border-b border-border px-4 py-3">
          <Text className="text-lg font-semibold text-foreground">
            Trade Offer
          </Text>
          <Pressable onPress={handleClose}>
            <X size={24} color="#6b7280" />
          </Pressable>
        </View>

        <ScrollView className="flex-1 px-4 py-4" keyboardShouldPersistTaps="handled">
          {/* Offering section */}
          <Text className="mb-2 text-sm font-semibold text-foreground">
            I'm offering
          </Text>
          <View className="mb-1 flex-row flex-wrap gap-2">
            {offering.map((card, i) => (
              <CardPill
                key={`offer-${card.externalId}-${i}`}
                card={card}
                onRemove={() =>
                  setOffering((prev) => prev.filter((_, idx) => idx !== i))
                }
              />
            ))}
          </View>
          <View className="mb-4 flex-row items-center rounded-lg border border-input bg-background px-3">
            <Search size={14} color="#9ca3af" />
            <TextInput
              value={offerSearch}
              onChangeText={setOfferSearch}
              placeholder="Search your collection..."
              placeholderTextColor="#9ca3af"
              className="ml-2 flex-1 py-2.5 text-sm text-foreground"
            />
          </View>
          {ownCards.length > 0 ? (
            <View className="mb-4 rounded-lg border border-border">
              {ownCards.map((card) => renderSearchResult(card, addToOffering))}
            </View>
          ) : null}

          {/* Requesting section */}
          <Text className="mb-2 text-sm font-semibold text-foreground">
            I'm requesting
          </Text>
          <View className="mb-1 flex-row flex-wrap gap-2">
            {requesting.map((card, i) => (
              <CardPill
                key={`req-${card.externalId}-${i}`}
                card={card}
                onRemove={() =>
                  setRequesting((prev) => prev.filter((_, idx) => idx !== i))
                }
              />
            ))}
          </View>
          <View className="mb-4 flex-row items-center rounded-lg border border-input bg-background px-3">
            <Search size={14} color="#9ca3af" />
            <TextInput
              value={requestSearch}
              onChangeText={setRequestSearch}
              placeholder="Search their collection..."
              placeholderTextColor="#9ca3af"
              className="ml-2 flex-1 py-2.5 text-sm text-foreground"
            />
          </View>
          {otherCards.length > 0 ? (
            <View className="mb-4 rounded-lg border border-border">
              {otherCards.map((card) =>
                renderSearchResult(card, addToRequesting),
              )}
            </View>
          ) : null}

          {/* Cash toggle */}
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-sm font-medium text-foreground">
              Include cash?
            </Text>
            <Switch value={showCash} onValueChange={setShowCash} />
          </View>
          {showCash ? (
            <View className="mb-4 gap-3">
              <Input
                label="Amount ($)"
                value={cashAmount}
                onChangeText={setCashAmount}
                keyboardType="decimal-pad"
                placeholder="0.00"
              />
              <View className="flex-row gap-2">
                <Pressable
                  onPress={() => setCashDirection('offering')}
                  className={cn(
                    'flex-1 items-center rounded-lg border py-2.5',
                    cashDirection === 'offering'
                      ? 'border-primary bg-primary/10'
                      : 'border-border',
                  )}
                >
                  <Text
                    className={cn(
                      'text-sm font-medium',
                      cashDirection === 'offering'
                        ? 'text-primary'
                        : 'text-muted-foreground',
                    )}
                  >
                    I'll pay
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setCashDirection('requesting')}
                  className={cn(
                    'flex-1 items-center rounded-lg border py-2.5',
                    cashDirection === 'requesting'
                      ? 'border-primary bg-primary/10'
                      : 'border-border',
                  )}
                >
                  <Text
                    className={cn(
                      'text-sm font-medium',
                      cashDirection === 'requesting'
                        ? 'text-primary'
                        : 'text-muted-foreground',
                    )}
                  >
                    They pay
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : null}

          {/* Note */}
          <Input
            label="Note (optional)"
            value={note}
            onChangeText={setNote}
            placeholder="Any additional details..."
            multiline
            className="min-h-[60px]"
          />
        </ScrollView>

        {/* Send button */}
        <View className="border-t border-border px-4 py-3">
          <Button
            size="lg"
            onPress={handleSendOffer}
            disabled={
              offering.length === 0 ||
              requesting.length === 0 ||
              sendMessage.isPending
            }
          >
            {sendMessage.isPending ? 'Sending...' : 'Send Offer'}
          </Button>
        </View>
      </View>
    </Modal>
  );
};

export default OfferModal;
