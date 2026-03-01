import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import { Marker, Callout } from 'react-native-maps';
import { Store } from 'lucide-react-native';

type MeetupMapMarkerProps = {
  coordinate: { latitude: number; longitude: number };
  title?: string;
  label?: string;
};

/**
 * Prominent map marker for meetup locations — large primary circle with pulsing halo,
 * Store icon, and optional shop name label chip. Designed to stand out clearly
 * from default Google Maps POI pins.
 */
const MeetupMapMarker = ({ coordinate, title, label }: MeetupMapMarkerProps) => {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.7,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  return (
    <Marker coordinate={coordinate}>
      <View className="items-center">
        {/* Pulse ring */}
        <Animated.View
          className="absolute h-14 w-14 rounded-full bg-primary"
          style={{ opacity: pulseAnim }}
        />
        {/* Main circle */}
        <View className="h-11 w-11 items-center justify-center rounded-full border-4 border-primary/30 bg-primary shadow-lg">
          <Store size={22} color="white" />
        </View>
        {/* Triangle pointer */}
        <View className="h-0 w-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-primary" />
        {/* Label chip */}
        {label ? (
          <View className="mt-1 max-w-[140px] rounded-full bg-background/90 px-2 py-0.5 shadow-sm">
            <Text className="text-xs font-semibold text-foreground" numberOfLines={1}>
              {label}
            </Text>
          </View>
        ) : null}
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
