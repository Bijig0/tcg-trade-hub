import React from 'react';
import { View, Text, Pressable } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { MapPin } from 'lucide-react-native';

type LocationPreviewProps = {
  location: { latitude: number; longitude: number };
  locationName?: string;
  onPress?: () => void;
  height?: number;
};

/**
 * Compact read-only mini-map with pin and location name.
 * Used in listing review steps and as the default collapsed state
 * before opening the full LocationPicker.
 */
const LocationPreview = ({
  location,
  locationName,
  onPress,
  height = 120,
}: LocationPreviewProps) => {
  const region = {
    ...location,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  return (
    <Pressable onPress={onPress} disabled={!onPress}>
      <View className="overflow-hidden rounded-xl border border-border" style={{ height }}>
        <MapView
          style={{ flex: 1 }}
          region={region}
          scrollEnabled={false}
          zoomEnabled={false}
          rotateEnabled={false}
          pitchEnabled={false}
          pointerEvents="none"
        >
          <Marker coordinate={location}>
            <MapPin size={24} color="#ef4444" fill="#ef4444" />
          </Marker>
        </MapView>
      </View>
      {locationName ? (
        <Text className="mt-1 text-xs text-muted-foreground" numberOfLines={1}>
          {locationName}
        </Text>
      ) : null}
    </Pressable>
  );
};

export default LocationPreview;
