import React from 'react';
import { View, Text, Image, ScrollView } from 'react-native';
import Badge from '@/components/ui/Badge/Badge';
import { ListingTypeBadge } from '@/features/listings';
import type { ListingWithDistance } from '@/features/feed/schemas';

type MyCardSummaryProps = {
  listing: ListingWithDistance;
};

const CONDITION_LABELS: Record<string, string> = {
  nm: 'Near Mint',
  lp: 'Lightly Played',
  mp: 'Moderately Played',
  hp: 'Heavily Played',
  dmg: 'Damaged',
};

/**
 * Owner's card summary displayed at the top of the bottom sheet.
 * Adapts display based on listing type (WTS, WTB, WTT).
 */
const MyCardSummary = ({ listing }: MyCardSummaryProps) => {
  const tradeWants = listing.trade_wants as Array<{
    card_name?: string;
    card_image_url?: string;
  }> | null;

  return (
    <View className="flex-row gap-3 px-4 py-3">
      {/* Card thumbnail */}
      <Image
        source={{ uri: listing.card_image_url }}
        className="h-20 w-14 rounded-lg bg-muted"
        resizeMode="cover"
      />

      {/* Card info */}
      <View className="flex-1 justify-center">
        <View className="flex-row items-center gap-1.5">
          <ListingTypeBadge type={listing.type} />
          <Badge variant="outline">
            {CONDITION_LABELS[listing.condition] ?? listing.condition}
          </Badge>
        </View>

        <Text className="mt-1 text-base font-bold text-foreground" numberOfLines={1}>
          {listing.card_name}
        </Text>

        <Text className="text-xs text-muted-foreground" numberOfLines={1}>
          {listing.card_set} &middot; #{listing.card_number}
        </Text>

        {/* WTS: Show asking price + market comparison */}
        {listing.type === 'wts' && (
          <View className="mt-1 flex-row items-baseline gap-2">
            {listing.asking_price != null && (
              <Text className="text-lg font-bold text-foreground">
                ${listing.asking_price.toFixed(2)}
              </Text>
            )}
            {listing.card_market_price != null && (
              <Text className="text-xs text-muted-foreground">
                Mkt: ${listing.card_market_price.toFixed(2)}
              </Text>
            )}
          </View>
        )}

        {/* WTB: Show budget */}
        {listing.type === 'wtb' && listing.asking_price != null && (
          <View className="mt-1">
            <Text className="text-lg font-bold text-foreground">
              Budget: ${listing.asking_price.toFixed(2)}
            </Text>
          </View>
        )}

        {/* WTT: Show wanted cards as horizontal thumbnails */}
        {listing.type === 'wtt' && tradeWants && tradeWants.length > 0 && (
          <View className="mt-1.5">
            <Text className="mb-1 text-xs text-muted-foreground">Wants:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-1.5">
                {tradeWants.map((want, idx) => (
                  <View key={`want-${idx}`} className="items-center">
                    {want.card_image_url ? (
                      <Image
                        source={{ uri: want.card_image_url }}
                        className="h-10 w-7 rounded bg-muted"
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="h-10 w-7 items-center justify-center rounded bg-muted">
                        <Text className="text-xs text-muted-foreground">?</Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        )}
      </View>
    </View>
  );
};

export default MyCardSummary;
