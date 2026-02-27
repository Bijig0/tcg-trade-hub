import React from 'react';
import { View, Text } from 'react-native';
import { Marker } from 'react-native-maps';
import type { RelevantShop } from '../../schemas';

type TraderMarkerProps = {
  shop: RelevantShop;
  onPress?: (shop: RelevantShop) => void;
};

/**
 * Custom map marker for shops showing a name pill.
 * Tapping opens shop details in the bottom sheet.
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
    </Marker>
  );
};

export default TraderMarker;
