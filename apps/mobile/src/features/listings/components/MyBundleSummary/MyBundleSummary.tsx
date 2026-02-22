import React from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { ListingTypeBadge } from '@/features/listings';
import Badge from '@/components/ui/Badge/Badge';
import BundlePreview from '../BundlePreview/BundlePreview';
import { CONDITION_LABELS } from '@/config/constants';
import type { ListingWithDistance } from '@/features/feed/schemas';
import type { ListingItemRow } from '@tcg-trade-hub/database';

type MyBundleSummaryProps = {
  listing: ListingWithDistance;
  onCardPress?: (item: ListingItemRow) => void;
};

/**
 * Owner's bundle summary at the top of the bottom sheet.
 * Shows bundle preview grid, title, item count, and cash amount.
 * When onCardPress is provided, renders tappable card rows below the summary.
 */
const MyBundleSummary = ({ listing, onCardPress }: MyBundleSummaryProps) => {
  return (
    <View>
      <View className="flex-row gap-3 px-4 py-3">
        <BundlePreview items={listing.items} size="lg" />

        <View className="flex-1 justify-center">
          <ListingTypeBadge type={listing.type} />

          <Text className="mt-1 text-base font-bold text-foreground" numberOfLines={1}>
            {listing.title}
          </Text>

          <Text className="text-xs text-muted-foreground">
            {listing.items.length} card{listing.items.length !== 1 ? 's' : ''}
          </Text>

          {listing.cash_amount > 0 && (
            <Text className="mt-1 text-lg font-bold text-foreground">
              ${listing.cash_amount.toFixed(2)}
            </Text>
          )}

          {listing.total_value > 0 && (
            <Text className="text-xs text-muted-foreground">
              Total value: ${listing.total_value.toFixed(2)}
            </Text>
          )}
        </View>
      </View>

      {/* Tappable card list when handler is provided */}
      {onCardPress && listing.items.length > 0 && (
        <View className="px-4 pb-2">
          {listing.items.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => onCardPress(item)}
              className="mb-1.5 flex-row items-center gap-2.5 rounded-lg border border-border bg-card p-2 active:bg-accent"
            >
              <Image
                source={{ uri: item.card_image_url }}
                className="h-12 w-8 rounded bg-muted"
                resizeMode="cover"
              />
              <View className="flex-1">
                <Text className="text-sm font-medium text-foreground" numberOfLines={1}>
                  {item.card_name}
                </Text>
                <View className="flex-row items-center gap-2">
                  {item.card_set ? (
                    <Text className="text-xs text-muted-foreground" numberOfLines={1}>
                      {item.card_set}{item.card_number ? ` #${item.card_number}` : ''}
                    </Text>
                  ) : null}
                  <Badge variant="secondary">
                    {CONDITION_LABELS[item.condition] ?? item.condition}
                  </Badge>
                </View>
              </View>
              <ChevronRight size={14} className="text-muted-foreground" />
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
};

export default MyBundleSummary;
