import React from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { Star, ChevronRight } from 'lucide-react-native';
import Avatar from '@/components/ui/Avatar/Avatar';
import Button from '@/components/ui/Button/Button';
import BundlePreview from '../BundlePreview/BundlePreview';
import OfferStatusBadge from '../OfferStatusBadge/OfferStatusBadge';
import type { OfferWithItems } from '../../schemas';
import type { ListingItemRow } from '@tcg-trade-hub/database';

type ReceivedOfferCardProps = {
  offer: OfferWithItems;
  onAccept: (offerId: string) => void;
  onDecline: (offerId: string) => void;
  isResponding: boolean;
  onPress?: (offer: OfferWithItems) => void;
};

/**
 * Card showing a received offer with offerer info, bundle preview,
 * cash amount, and accept/decline buttons.
 */
const ReceivedOfferCard = ({ offer, onAccept, onDecline, isResponding, onPress }: ReceivedOfferCardProps) => {
  const totalItemValue = offer.items.reduce(
    (sum, item) => sum + (item.market_price ?? 0),
    0,
  );
  const totalValue = totalItemValue + offer.cash_amount;

  // BundlePreview expects ListingItemRow[] but offer items share the
  // subset of fields it actually uses (id, card_image_url).
  const previewItems = offer.items as unknown as ListingItemRow[];

  return (
    <Pressable
      onPress={onPress ? () => onPress(offer) : undefined}
      disabled={!onPress}
      className="mx-4 mb-3 rounded-xl border border-border bg-card p-3 active:bg-accent"
    >
      {/* Offerer info */}
      <View className="flex-row items-center gap-2">
        <Avatar
          uri={offer.offerer.avatar_url}
          fallback={offer.offerer.display_name.slice(0, 2).toUpperCase()}
          size="sm"
        />
        <View className="flex-1">
          <Text className="text-sm font-semibold text-card-foreground">
            {offer.offerer.display_name}
          </Text>
          <View className="flex-row items-center gap-1">
            <Star size={10} color="#eab308" fill="#eab308" />
            <Text className="text-xs text-muted-foreground">
              {offer.offerer.rating_score.toFixed(1)} · {offer.offerer.total_trades} trades
            </Text>
          </View>
        </View>
        <OfferStatusBadge status={offer.status} />
        {onPress ? <ChevronRight size={14} className="ml-1 text-muted-foreground" /> : null}
      </View>

      {/* Offer content */}
      <View className="mt-2">
        {offer.items.length > 0 && (
          <View className="flex-row items-center gap-2">
            <Text className="text-xs text-muted-foreground">Offers:</Text>
            <BundlePreview items={previewItems} size="sm" />
          </View>
        )}

        {offer.cash_amount > 0 && (
          <Text className="mt-1 text-sm font-semibold text-foreground">
            {offer.items.length > 0 ? '+ ' : ''}${offer.cash_amount.toFixed(2)} cash
          </Text>
        )}

        <Text className="mt-1 text-xs text-muted-foreground">
          Total value: ${totalValue.toFixed(2)}
        </Text>

        {offer.message && (
          <Text className="mt-1 text-xs italic text-muted-foreground" numberOfLines={2}>
            "{offer.message}"
          </Text>
        )}
      </View>

      {/* Action buttons (only for pending offers) */}
      {offer.status === 'pending' && (
        <View className="mt-2.5 flex-row gap-2">
          <Button
            size="sm"
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
            size="sm"
            className="flex-1"
            onPress={() => onDecline(offer.id)}
            disabled={isResponding}
          >
            <Text className="text-sm font-semibold text-foreground">Decline</Text>
          </Button>
        </View>
      )}
    </Pressable>
  );
};

export default ReceivedOfferCard;
