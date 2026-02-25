import React, { forwardRef, useCallback } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Star, ChevronRight } from 'lucide-react-native';
import Avatar from '@/components/ui/Avatar/Avatar';
import Button from '@/components/ui/Button/Button';
import Badge from '@/components/ui/Badge/Badge';
import OfferStatusBadge from '../OfferStatusBadge/OfferStatusBadge';
import { CONDITION_LABELS } from '@/config/constants';
import type { OfferWithItems } from '../../schemas';
import type { OfferItemRow } from '@tcg-trade-hub/database';

type OfferDetailSheetProps = {
  offer: OfferWithItems | null;
  onClose: () => void;
  onAccept: (offerId: string) => void;
  onDecline: (offerId: string) => void;
  isResponding: boolean;
  onCardPress: (item: OfferItemRow) => void;
};

const SNAP_POINTS = ['70%', '92%'];

/**
 * Stacked bottom sheet showing full offer details when tapping a ReceivedOfferCard.
 * Displays offerer profile, offered cards (tappable), cash, total value, and accept/decline.
 */
const OfferDetailSheet = forwardRef<BottomSheet, OfferDetailSheetProps>(
  ({ offer, onClose, onAccept, onDecline, isResponding, onCardPress }, ref) => {
    const handleClose = useCallback(() => {
      onClose();
    }, [onClose]);

    if (!offer) return null;

    const totalItemValue = offer.items.reduce(
      (sum, item) => sum + (item.market_price ?? 0),
      0,
    );
    const totalValue = totalItemValue + offer.cash_amount;

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={SNAP_POINTS}
        enablePanDownToClose
        onClose={handleClose}
        backgroundStyle={{ borderRadius: 20, backgroundColor: '#0f0f13' }}
        handleIndicatorStyle={{ backgroundColor: '#a1a1aa', width: 40 }}
      >
        <BottomSheetScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Offerer info */}
          <View className="flex-row items-center gap-3 px-4 pb-3 pt-1">
            <Avatar
              uri={offer.offerer.avatar_url}
              fallback={offer.offerer.display_name.slice(0, 2).toUpperCase()}
              size="lg"
            />
            <View className="flex-1">
              <Text className="text-base font-semibold text-foreground">
                {offer.offerer.display_name}
              </Text>
              <View className="flex-row items-center gap-1">
                <Star size={12} color="#eab308" fill="#eab308" />
                <Text className="text-sm text-muted-foreground">
                  {offer.offerer.rating_score.toFixed(1)} · {offer.offerer.total_trades} trades
                </Text>
              </View>
            </View>
            <OfferStatusBadge status={offer.status} />
          </View>

          {/* Offered cards */}
          {offer.items.length > 0 && (
            <View className="mt-2 px-4">
              <Text className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Offered Cards
              </Text>
              {offer.items.map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() => onCardPress(item)}
                  className="mb-2 flex-row items-center gap-3 rounded-xl border border-border bg-card p-2.5 active:bg-accent"
                >
                  <Image
                    source={{ uri: item.card_image_url }}
                    className="h-14 w-10 rounded-md bg-muted"
                    contentFit="cover"
                    cachePolicy="disk"
                    transition={150}
                  />
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
                      {item.card_name}
                    </Text>
                    <Text className="text-xs text-muted-foreground" numberOfLines={1}>
                      {item.card_set ? `${item.card_set}` : ''}
                      {item.card_number ? ` #${item.card_number}` : ''}
                    </Text>
                    <View className="mt-0.5 flex-row items-center gap-2">
                      <Badge variant="secondary">
                        {CONDITION_LABELS[item.condition] ?? item.condition}
                      </Badge>
                      {item.market_price != null && (
                        <Text className="text-xs font-medium text-foreground">
                          ${item.market_price.toFixed(2)}
                        </Text>
                      )}
                    </View>
                  </View>
                  <ChevronRight size={16} className="text-muted-foreground" />
                </Pressable>
              ))}
            </View>
          )}

          {/* Cash amount */}
          {offer.cash_amount > 0 && (
            <View className="mt-2 px-4">
              <Text className="text-sm font-semibold text-foreground">
                + ${offer.cash_amount.toFixed(2)} cash
              </Text>
            </View>
          )}

          {/* Total value */}
          <View className="mx-4 mt-3 border-t border-border pt-3">
            <Text className="text-sm font-semibold text-foreground">
              Total offer value: ${totalValue.toFixed(2)}
            </Text>
          </View>

          {/* Message */}
          {offer.message && (
            <View className="mt-3 px-4">
              <Text className="text-sm italic text-muted-foreground">
                &ldquo;{offer.message}&rdquo;
              </Text>
            </View>
          )}

          {/* Accept / Decline */}
          {offer.status === 'pending' && (
            <View className="mt-5 flex-row gap-3 px-4">
              <Button
                className="flex-1"
                onPress={() => onAccept(offer.id)}
                disabled={isResponding}
              >
                {isResponding ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="text-sm font-semibold text-primary-foreground">Accept</Text>
                )}
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onPress={() => onDecline(offer.id)}
                disabled={isResponding}
              >
                <Text className="text-sm font-semibold text-foreground">Decline</Text>
              </Button>
            </View>
          )}
        </BottomSheetScrollView>
      </BottomSheet>
    );
  },
);

OfferDetailSheet.displayName = 'OfferDetailSheet';

export default OfferDetailSheet;
