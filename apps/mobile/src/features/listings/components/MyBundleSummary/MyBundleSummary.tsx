import React from 'react';
import { View, Text } from 'react-native';
import { ListingTypeBadge } from '@/features/listings';
import BundlePreview from '../BundlePreview/BundlePreview';
import type { ListingWithDistance } from '@/features/feed/schemas';

type MyBundleSummaryProps = {
  listing: ListingWithDistance;
};

/**
 * Owner's bundle summary at the top of the bottom sheet.
 * Shows bundle preview grid, title, item count, and cash amount.
 */
const MyBundleSummary = ({ listing }: MyBundleSummaryProps) => {
  return (
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
  );
};

export default MyBundleSummary;
