import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';

export type TypingIndicatorProps = {
  isVisible: boolean;
  userName: string;
};

const DOT_COUNT = 3;
const ANIMATION_DURATION = 600;

/** Three animated pulsing dots with "{name} is typing..." label. */
const TypingIndicator = ({ isVisible, userName }: TypingIndicatorProps) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const dotAnims = useRef(
    Array.from({ length: DOT_COUNT }, () => new Animated.Value(0.3)),
  ).current;

  // Fade in/out
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: isVisible ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isVisible, fadeAnim]);

  // Pulsing dots
  useEffect(() => {
    if (!isVisible) return;

    const animations = dotAnims.map((anim, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 200),
          Animated.timing(anim, {
            toValue: 1,
            duration: ANIMATION_DURATION,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0.3,
            duration: ANIMATION_DURATION,
            useNativeDriver: true,
          }),
        ]),
      ),
    );

    animations.forEach((a) => a.start());

    return () => {
      animations.forEach((a) => a.stop());
      dotAnims.forEach((a) => a.setValue(0.3));
    };
  }, [isVisible, dotAnims]);

  if (!isVisible) return null;

  return (
    <Animated.View
      className="flex-row items-center gap-1.5 px-4 py-1.5"
      style={{ opacity: fadeAnim }}
    >
      <View className="flex-row items-center gap-1 rounded-2xl bg-secondary px-3 py-2">
        {dotAnims.map((anim, i) => (
          <Animated.View
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-muted-foreground"
            style={{ opacity: anim }}
          />
        ))}
      </View>
      <Text className="text-xs text-muted-foreground">
        {userName} is typing...
      </Text>
    </Animated.View>
  );
};

export default TypingIndicator;
