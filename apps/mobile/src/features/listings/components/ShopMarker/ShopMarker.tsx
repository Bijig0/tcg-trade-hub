import React from 'react';
import { View } from 'react-native';
import { Marker } from 'react-native-maps';
import { Store } from 'lucide-react-native';
import type { RelevantShop } from '../../schemas';

type ShopMarkerProps = {
  shop: RelevantShop;
  onPress?: (shop: RelevantShop) => void;
};

/**
 * Custom map marker for game stores — purple circle with store icon.
 * Tapping opens shop details in the bottom sheet.
 */
const ShopMarker = ({ shop, onPress }: ShopMarkerProps) => {
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
        <View className="h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-purple-600 shadow-md">
          <Store size={16} color="white" />
        </View>
        <View className="h-0 w-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-purple-600" />
      </View>
    </Marker>
  );
};

export default ShopMarker;
