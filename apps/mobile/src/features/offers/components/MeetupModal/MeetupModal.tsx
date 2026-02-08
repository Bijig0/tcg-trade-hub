import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { X, MapPin, Check } from 'lucide-react-native';
import { cn } from '@/lib/cn';
import { supabase } from '@/lib/supabase';
import Button from '@/components/ui/Button/Button';
import Input from '@/components/ui/Input/Input';
import useSendMessage from '@/features/chat/hooks/useSendMessage/useSendMessage';
import type { ShopRow, MeetupProposalPayload } from '@tcg-trade-hub/database';

export type MeetupModalProps = {
  visible: boolean;
  onClose: () => void;
  conversationId: string;
};

type LocationOption =
  | { type: 'shop'; shop: ShopRow }
  | { type: 'custom' };

/** Modal for creating a meetup proposal with location selection, date/time pickers, and a note */
const MeetupModal = ({
  visible,
  onClose,
  conversationId,
}: MeetupModalProps) => {
  const sendMessage = useSendMessage();
  const [shops, setShops] = useState<ShopRow[]>([]);
  const [isLoadingShops, setIsLoadingShops] = useState(false);
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  const [useCustomLocation, setUseCustomLocation] = useState(false);
  const [customLocation, setCustomLocation] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [note, setNote] = useState('');

  // Fetch nearby shops when modal opens
  useEffect(() => {
    if (!visible) return;

    const fetchShops = async () => {
      setIsLoadingShops(true);
      const { data } = await supabase
        .from('shops')
        .select('*')
        .eq('verified', true)
        .order('name', { ascending: true })
        .limit(20);
      setShops((data as ShopRow[]) ?? []);
      setIsLoadingShops(false);
    };

    fetchShops();
  }, [visible]);

  const handleClose = useCallback(() => {
    setSelectedShopId(null);
    setUseCustomLocation(false);
    setCustomLocation('');
    setDate('');
    setTime('');
    setNote('');
    onClose();
  }, [onClose]);

  const handleSelectShop = useCallback((shopId: string) => {
    setSelectedShopId(shopId);
    setUseCustomLocation(false);
  }, []);

  const handleSelectCustom = useCallback(() => {
    setSelectedShopId(null);
    setUseCustomLocation(true);
  }, []);

  const handleSendProposal = useCallback(() => {
    const selectedShop = shops.find((s) => s.id === selectedShopId);
    const locationName = useCustomLocation
      ? customLocation.trim()
      : selectedShop?.name ?? '';

    if (!locationName) return;

    // Build proposed_time ISO string if date is provided
    let proposedTime: string | undefined;
    if (date.trim()) {
      const dateStr = date.trim();
      const timeStr = time.trim() || '12:00';
      const parsed = new Date(`${dateStr}T${timeStr}`);
      if (!isNaN(parsed.getTime())) {
        proposedTime = parsed.toISOString();
      }
    }

    const payload: MeetupProposalPayload = {
      ...(selectedShopId ? { shop_id: selectedShopId } : {}),
      location_name: locationName,
      ...(proposedTime ? { proposed_time: proposedTime } : {}),
      ...(note.trim() ? { note: note.trim() } : {}),
    };

    sendMessage.mutate(
      {
        conversationId,
        type: 'meetup_proposal',
        body: 'Proposed a meetup',
        payload: payload as unknown as Record<string, unknown>,
      },
      {
        onSuccess: handleClose,
      },
    );
  }, [
    selectedShopId,
    useCustomLocation,
    customLocation,
    date,
    time,
    note,
    shops,
    conversationId,
    sendMessage,
    handleClose,
  ]);

  const hasLocation = useCustomLocation
    ? customLocation.trim().length > 0
    : selectedShopId !== null;

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
            Propose Meetup
          </Text>
          <Pressable onPress={handleClose}>
            <X size={24} color="#6b7280" />
          </Pressable>
        </View>

        <ScrollView className="flex-1 px-4 py-4" keyboardShouldPersistTaps="handled">
          {/* Location section */}
          <Text className="mb-3 text-sm font-semibold text-foreground">
            Location
          </Text>

          {isLoadingShops ? (
            <ActivityIndicator className="py-6" />
          ) : (
            <View className="mb-4 gap-2">
              {shops.map((shop) => (
                <Pressable
                  key={shop.id}
                  onPress={() => handleSelectShop(shop.id)}
                  className={cn(
                    'flex-row items-center gap-3 rounded-xl border px-4 py-3',
                    selectedShopId === shop.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border',
                  )}
                >
                  <MapPin
                    size={18}
                    color={selectedShopId === shop.id ? '#7c3aed' : '#6b7280'}
                  />
                  <View className="flex-1">
                    <Text
                      className={cn(
                        'text-sm font-medium',
                        selectedShopId === shop.id
                          ? 'text-primary'
                          : 'text-foreground',
                      )}
                    >
                      {shop.name}
                    </Text>
                    <Text className="text-xs text-muted-foreground" numberOfLines={1}>
                      {shop.address}
                    </Text>
                  </View>
                  {selectedShopId === shop.id ? (
                    <Check size={18} color="#7c3aed" />
                  ) : null}
                </Pressable>
              ))}

              {/* Custom location option */}
              <Pressable
                onPress={handleSelectCustom}
                className={cn(
                  'flex-row items-center gap-3 rounded-xl border px-4 py-3',
                  useCustomLocation
                    ? 'border-primary bg-primary/5'
                    : 'border-border',
                )}
              >
                <MapPin
                  size={18}
                  color={useCustomLocation ? '#7c3aed' : '#6b7280'}
                />
                <Text
                  className={cn(
                    'text-sm font-medium',
                    useCustomLocation
                      ? 'text-primary'
                      : 'text-foreground',
                  )}
                >
                  Custom location
                </Text>
                {useCustomLocation ? (
                  <Check size={18} color="#7c3aed" />
                ) : null}
              </Pressable>
            </View>
          )}

          {useCustomLocation ? (
            <View className="mb-4">
              <Input
                label="Location name"
                value={customLocation}
                onChangeText={setCustomLocation}
                placeholder="e.g. Starbucks on Main St"
              />
            </View>
          ) : null}

          {/* Date and time */}
          <Text className="mb-3 text-sm font-semibold text-foreground">
            When (optional)
          </Text>
          <View className="mb-4 flex-row gap-3">
            <View className="flex-1">
              <Input
                label="Date"
                value={date}
                onChangeText={setDate}
                placeholder="YYYY-MM-DD"
              />
            </View>
            <View className="flex-1">
              <Input
                label="Time"
                value={time}
                onChangeText={setTime}
                placeholder="HH:MM"
              />
            </View>
          </View>

          {/* Note */}
          <Input
            label="Note (optional)"
            value={note}
            onChangeText={setNote}
            placeholder="Anything they should know..."
            multiline
            className="min-h-[60px]"
          />
        </ScrollView>

        {/* Send button */}
        <View className="border-t border-border px-4 py-3">
          <Button
            size="lg"
            onPress={handleSendProposal}
            disabled={!hasLocation || sendMessage.isPending}
          >
            {sendMessage.isPending ? 'Sending...' : 'Send Proposal'}
          </Button>
        </View>
      </View>
    </Modal>
  );
};

export default MeetupModal;
