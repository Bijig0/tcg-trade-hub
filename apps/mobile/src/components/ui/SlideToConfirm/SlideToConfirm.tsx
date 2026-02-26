import React, { useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  interpolate,
  interpolateColor,
  Extrapolation,
} from 'react-native-reanimated';
import { ChevronRight, Check } from 'lucide-react-native';

const THUMB_SIZE = 44;
const TRACK_HEIGHT = 48;
const CONFIRM_THRESHOLD = 0.8;

type SlideToConfirmProps = {
  onConfirm: () => void;
  label?: string;
  confirmedLabel?: string;
  disabled?: boolean;
  isConfirmed?: boolean;
  isPending?: boolean;
};

/**
 * Reusable horizontal slide-to-confirm gesture component.
 *
 * Renders a track with a draggable thumb. Sliding past 80% of the
 * track width triggers `onConfirm`. The thumb snaps back on release
 * below the threshold and locks at the end when confirmed.
 */
const SlideToConfirm = ({
  onConfirm,
  label = 'Slide to confirm',
  confirmedLabel = 'Confirmed',
  disabled = false,
  isConfirmed = false,
  isPending = false,
}: SlideToConfirmProps) => {
  const translateX = useSharedValue(0);
  const [trackWidth, setTrackWidth] = useState(0);

  const maxTravel = Math.max(trackWidth - THUMB_SIZE - 4, 0);

  const handleConfirm = () => {
    onConfirm();
  };

  const panGesture = Gesture.Pan()
    .enabled(!disabled && !isConfirmed && !isPending)
    .onUpdate((event) => {
      const clamped = Math.min(Math.max(event.translationX, 0), maxTravel);
      translateX.value = clamped;
    })
    .onEnd(() => {
      if (maxTravel > 0 && translateX.value / maxTravel >= CONFIRM_THRESHOLD) {
        translateX.value = withSpring(maxTravel, { damping: 15, stiffness: 120 });
        runOnJS(handleConfirm)();
      } else {
        translateX.value = withSpring(0, { damping: 15, stiffness: 120 });
      }
    });

  const thumbStyle = useAnimatedStyle(() => {
    if (isConfirmed) {
      return { transform: [{ translateX: maxTravel }] };
    }
    return { transform: [{ translateX: translateX.value }] };
  });

  const fillStyle = useAnimatedStyle(() => {
    const width = isConfirmed ? maxTravel + THUMB_SIZE : translateX.value + THUMB_SIZE;
    const bgColor = isConfirmed
      ? '#22c55e'
      : interpolateColor(
          translateX.value,
          [0, maxTravel || 1],
          ['rgba(34,197,94,0.15)', 'rgba(34,197,94,0.4)'],
        );
    return { width, backgroundColor: bgColor };
  });

  const labelOpacity = useAnimatedStyle(() => ({
    opacity: isConfirmed
      ? 0
      : interpolate(translateX.value, [0, maxTravel * 0.5], [1, 0], Extrapolation.CLAMP),
  }));

  return (
    <View
      className="overflow-hidden rounded-full bg-muted"
      style={{ height: TRACK_HEIGHT }}
      onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
    >
      {/* Fill overlay */}
      <Animated.View
        className="absolute left-0 top-0 bottom-0 rounded-full"
        style={fillStyle}
      />

      {/* Label text */}
      <Animated.View
        className="absolute inset-0 items-center justify-center"
        style={labelOpacity}
      >
        <Text className="text-sm font-medium text-muted-foreground">{label}</Text>
      </Animated.View>

      {/* Confirmed label */}
      {isConfirmed && (
        <View className="absolute inset-0 items-center justify-center">
          <Text className="text-sm font-semibold text-white">{confirmedLabel}</Text>
        </View>
      )}

      {/* Draggable thumb */}
      <GestureDetector gesture={panGesture}>
        <Animated.View
          className="absolute left-0.5 top-0.5 items-center justify-center rounded-full bg-primary"
          style={[
            { width: THUMB_SIZE, height: THUMB_SIZE },
            thumbStyle,
            isConfirmed && { backgroundColor: '#22c55e' },
          ]}
        >
          {isPending ? (
            <ActivityIndicator size="small" color="white" />
          ) : isConfirmed ? (
            <Check size={20} color="white" />
          ) : (
            <ChevronRight size={20} color="white" />
          )}
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

export default SlideToConfirm;
