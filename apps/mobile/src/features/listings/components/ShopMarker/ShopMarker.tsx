import React from 'react';
import { View, Text } from 'react-native';
import { Marker, Callout } from 'react-native-maps';
import { Store } from 'lucide-react-native';
import type { RelevantShop } from '../../schemas';

type ShopMarkerProps = {
  shop: RelevantShop;
};

/**
 * Custom map marker for game stores — purple circle with store icon.
 * Callout shows shop name and address.
 */
const ShopMarker = ({ shop }: ShopMarkerProps) => {
  if (shop.lat === 0 && shop.lng === 0) return null;

  return (
    <Marker
      coordinate={{
        latitude: shop.lat,
        longitude: shop.lng,
      }}
    >
      <View className="items-center">
        <View className="h-8 w-8 items-center justify-center rounded-full bg-purple-600 shadow-sm">
          <Store size={16} color="white" />
        </View>
        <View className="h-0 w-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-purple-600" />
      </View>
      <Callout>
        <View className="min-w-[140px] p-1">
          <Text className="text-sm font-semibold" numberOfLines={1}>
            {shop.name}
          </Text>
          <Text className="text-xs text-gray-500" numberOfLines={2}>
            {shop.address}
          </Text>
          {shop.verified && (
            <Text className="mt-0.5 text-xs text-purple-600">Verified</Text>
          )}
        </View>
      </Callout>
    </Marker>
  );
};

export default ShopMarker;
