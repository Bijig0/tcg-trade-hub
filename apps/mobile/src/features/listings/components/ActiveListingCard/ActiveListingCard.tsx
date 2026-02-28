import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Trash2, Clock, Zap } from 'lucide-react-native';
import ListingTypeBadges from '../ListingTypeBadges/ListingTypeBadges';
import BundlePreview from '../BundlePreview/BundlePreview';
import formatListingDate from '../../utils/formatListingDate/formatListingDate';
import type { MyListingWithOffers } from '../../schemas';

type ActiveListingCardProps = {
  listing: MyListingWithOffers;
  onDelete: (listing: MyListingWithOffers) => void;
};

/**
 * Card component for listings in the Active tab.
 *
 * Shows type badge, bundle preview, title, price, date, offer count badge,
 * and a delete button.
 */
const ActiveListingCard = ({ listing, onDelete }: ActiveListingCardProps) => {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push(`/(tabs)/(listings)/listing/${listing.id}`)}
      className="mx-4 mb-3 flex-row rounded-xl border border-border bg-card p-3 active:bg-accent"
    >
      <BundlePreview items={listing.items ?? []} size="md" />

      <View className="ml-3 flex-1 justify-between">
        <View>
          <View className="flex-row items-center gap-2">
            <ListingTypeBadges listing={listing} />
            {listing.offer_count > 0 && (
              <View className="rounded-full bg-primary px-2 py-0.5">
                <Text className="text-xs font-semibold text-primary-foreground">
                  {listing.offer_count} offer{listing.offer_count !== 1 ? 's' : ''}
                </Text>
              </View>
            )}
            {(listing.accepts_trades || listing.type === 'wtt') && (listing.trade_wants ?? []).length > 0 && (
              <View className="flex-row items-center gap-0.5 rounded-full bg-amber-500/10 px-2 py-0.5">
                <Zap size={10} color="#f59e0b" />
                <Text className="text-xs font-semibold text-amber-500">
                  Trades
                </Text>
              </View>
            )}
          </View>

          <Text
            className="mt-1 text-base font-semibold text-card-foreground"
            numberOfLines={1}
          >
            {listing.title}
          </Text>

          {listing.cash_amount > 0 && (
            <Text className="text-sm text-muted-foreground">
              ${listing.cash_amount.toFixed(2)}
            </Text>
          )}
        </View>

        <View className="mt-1 flex-row items-center gap-1">
          <Clock size={10} className="text-muted-foreground" />
          <Text className="text-xs text-muted-foreground">
            {formatListingDate(listing.created_at)}
          </Text>
        </View>
      </View>

      <Pressable
        onPress={() => onDelete(listing)}
        className="ml-2 items-center justify-center px-1"
        hitSlop={8}
      >
        <Trash2 size={18} className="text-destructive" />
      </Pressable>
    </Pressable>
  );
};

export default ActiveListingCard;
