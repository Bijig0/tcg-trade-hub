import React from 'react';
import { View, Text } from 'react-native';
import { Navigation, Clock } from 'lucide-react-native';

type DirectionsInfoBarProps = {
  /** Distance in kilometers */
  distanceKm: number;
  /** Duration in minutes */
  durationMin: number;
};

/**
 * Compact bar displaying route distance and estimated travel time.
 *
 * - Shows meters when distance < 1 km, km otherwise
 * - Shows minutes when duration < 60 min, hours + minutes otherwise
 */
const DirectionsInfoBar: React.FC<DirectionsInfoBarProps> = ({
  distanceKm,
  durationMin,
}) => {
  const distanceText =
    distanceKm < 1
      ? `${Math.round(distanceKm * 1000)} m`
      : `${distanceKm.toFixed(1)} km`;

  const durationText =
    durationMin < 60
      ? `${Math.round(durationMin)} min`
      : `${Math.floor(durationMin / 60)} hr ${Math.round(durationMin % 60)} min`;

  return (
    <View className="mt-2 flex-row items-center gap-4">
      <View className="flex-row items-center gap-1.5">
        <Navigation size={14} className="text-amber-500" />
        <Text className="text-sm font-medium text-foreground">{distanceText}</Text>
      </View>
      <View className="flex-row items-center gap-1.5">
        <Clock size={14} className="text-amber-500" />
        <Text className="text-sm font-medium text-foreground">{durationText}</Text>
      </View>
    </View>
  );
};

export default DirectionsInfoBar;
