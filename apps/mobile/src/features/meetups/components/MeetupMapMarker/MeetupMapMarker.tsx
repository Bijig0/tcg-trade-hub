import React from 'react';
import { View, Text } from 'react-native';
import { Marker, Callout } from 'react-native-maps';
import { MapPin } from 'lucide-react-native';

type MeetupMapMarkerProps = {
  coordinate: { latitude: number; longitude: number };
  title?: string;
};

/**
 * Custom map pin marker for meetup locations — amber circle with MapPin icon.
 */
const MeetupMapMarker = ({ coordinate, title }: MeetupMapMarkerProps) => {
  return (
    <Marker coordinate={coordinate}>
      <View className="items-center">
        <View className="h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-amber-500 shadow-md">
          <MapPin size={18} color="white" />
        </View>
        <View className="h-0 w-0 border-l-[5px] border-r-[5px] border-t-[5px] border-transparent border-t-amber-500" />
      </View>
      {title ? (
        <Callout>
          <View className="min-w-[120px] p-1">
            <Text className="text-sm font-semibold" numberOfLines={2}>
              {title}
            </Text>
          </View>
        </Callout>
      ) : null}
    </Marker>
  );
};

export default MeetupMapMarker;
