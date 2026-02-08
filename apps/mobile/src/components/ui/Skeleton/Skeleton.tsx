import React, { useEffect, useRef } from 'react';
import { Animated, type ViewStyle } from 'react-native';
import { cn } from '@/lib/cn';

export type SkeletonProps = {
  /**
   * Tailwind classes to control width, height, and border-radius.
   * @example "h-4 w-32 rounded-md"
   */
  className?: string;
};

/**
 * An animated skeleton placeholder that pulses to indicate loading content.
 *
 * Uses React Native's `Animated` API for a smooth opacity pulse effect.
 * Style the dimensions and shape via `className`.
 *
 * @example
 * ```tsx
 * <Skeleton className="h-4 w-48 rounded-md" />
 * <Skeleton className="h-10 w-10 rounded-full" />
 * ```
 */
const Skeleton = ({ className }: SkeletonProps) => {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => animation.stop();
  }, [opacity]);

  /**
   * NativeWind className works on Animated.View; we also pass opacity
   * as an inline style since Animated values cannot be expressed as classes.
   */
  const animatedStyle: Animated.WithAnimatedObject<ViewStyle> = { opacity };

  return (
    <Animated.View
      className={cn('rounded-md bg-muted', className)}
      style={animatedStyle}
    />
  );
};

export default Skeleton;
