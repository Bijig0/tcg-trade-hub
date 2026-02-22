import React from 'react';
import { View, Text } from 'react-native';
import { Marker, Callout } from 'react-native-maps';
import type { RelevantListing } from '../../schemas';

type TraderMarkerProps = {
  listing: RelevantListing;
  onPress: (listing: RelevantListing) => void;
};

/**
 * Custom map marker for traders showing a price pill (WTS/WTB)
 * or card initial (WTT). Callout shows card name.
 */
const TraderMarker = ({ listing, onPress }: TraderMarkerProps) => {
  const { owner } = listing;

  if (owner.approximate_lat === 0 && owner.approximate_lng === 0) return null;

  const label =
    listing.type === 'wtt'
      ? listing.card_name.charAt(0).toUpperCase()
      : listing.asking_price != null
        ? `$${listing.asking_price}`
        : listing.card_name.charAt(0).toUpperCase();

  return (
    <Marker
      coordinate={{
        latitude: owner.approximate_lat,
        longitude: owner.approximate_lng,
      }}
      onPress={() => onPress(listing)}
    >
      <View className="items-center">
        <View className="rounded-full bg-amber-500 px-2.5 py-1.5 shadow-sm">
          <Text className="text-xs font-bold text-white" numberOfLines={1}>
            {label}
          </Text>
        </View>
        <View className="h-0 w-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-amber-500" />
      </View>
      <Callout>
        <View className="min-w-[120px] p-1">
          <Text className="text-sm font-semibold" numberOfLines={1}>
            {listing.card_name}
          </Text>
          <Text className="text-xs text-gray-500">
            {owner.display_name} - Tap to view
          </Text>
        </View>
      </Callout>
    </Marker>
  );
};

export default TraderMarker;
