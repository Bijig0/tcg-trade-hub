import React from 'react';
import { View, Text } from 'react-native';
import { Marker, Callout } from 'react-native-maps';
import type { RelevantShop } from '../../schemas';

type TraderMarkerProps = {
  shop: RelevantShop;
  onPress?: (shop: RelevantShop) => void;
};

/**
 * Custom map marker for shops showing a name pill.
 * Replaces the old trader-based marker since listings no longer carry trader locations.
 */
const TraderMarker = ({ shop, onPress }: TraderMarkerProps) => {
  if (shop.lat === 0 && shop.lng === 0) return null;

  return (
    <Marker
      coordinate={{
        latitude: shop.lat,
        longitude: shop.lng,
      }}
      onPress={() => onPress?.(shop)}
    >
      <View className="items-center">
        <View className="rounded-full border-2 border-white bg-amber-500 px-2.5 py-1.5 shadow-md">
          <Text className="text-xs font-bold text-white" numberOfLines={1}>
            {shop.name.charAt(0)}
          </Text>
        </View>
        <View className="h-0 w-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-amber-500" />
      </View>
      <Callout>
        <View className="min-w-[120px] p-1">
          <Text className="text-sm font-semibold" numberOfLines={1}>
            {shop.name}
          </Text>
          <Text className="text-xs text-gray-500">
            {shop.address}
          </Text>
        </View>
      </Callout>
    </Marker>
  );
};

export default TraderMarker;
