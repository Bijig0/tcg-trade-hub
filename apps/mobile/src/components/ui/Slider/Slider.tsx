import React, { useRef, useCallback } from 'react';
import {
  View,
  Text,
  PanResponder,
  type LayoutChangeEvent,
  type GestureResponderEvent,
  type PanResponderGestureState,
} from 'react-native';
import { cn } from '@/lib/cn';

export type SliderProps = {
  /** Current numeric value */
  value: number;
  /** Callback fired when the user drags the thumb */
  onValueChange: (value: number) => void;
  /** Minimum value (default 0) */
  min?: number;
  /** Maximum value (default 100) */
  max?: number;
  /** Step increment (default 1) */
  step?: number;
  /** Optional label displayed above the slider */
  label?: string;
  /** Whether to display the numeric value next to the label */
  showValue?: boolean;
  /** Additional Tailwind classes for the outer container */
  className?: string;
};

/**
 * A custom range slider built with `PanResponder` (no external dependencies).
 *
 * Renders a horizontal track with a draggable thumb. The filled portion of the
 * track uses the primary colour.
 *
 * @example
 * ```tsx
 * <Slider
 *   label="Max Price"
 *   value={price}
 *   onValueChange={setPrice}
 *   min={0}
 *   max={500}
 *   step={5}
 *   showValue
 * />
 * ```
 */
const Slider = ({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  showValue = false,
  className,
}: SliderProps) => {
  const trackWidth = useRef(0);

  const clampAndStep = useCallback(
    (raw: number) => {
      const stepped = Math.round(raw / step) * step;
      return Math.min(max, Math.max(min, stepped));
    },
    [min, max, step],
  );

  const handleMove = useCallback(
    (_e: GestureResponderEvent, gestureState: PanResponderGestureState) => {
      if (trackWidth.current === 0) return;
      const ratio = Math.max(
        0,
        Math.min(1, gestureState.moveX / trackWidth.current),
      );
      const raw = min + ratio * (max - min);
      onValueChange(clampAndStep(raw));
    },
    [min, max, onValueChange, clampAndStep],
  );

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: handleMove,
      onPanResponderMove: handleMove,
    }),
  ).current;

  const onLayout = (e: LayoutChangeEvent) => {
    trackWidth.current = e.nativeEvent.layout.width;
  };

  const percentage =
    max === min ? 0 : ((value - min) / (max - min)) * 100;

  return (
    <View className={cn('gap-2', className)}>
      {(label || showValue) ? (
        <View className="flex-row items-center justify-between">
          {label ? (
            <Text className="text-sm font-medium text-foreground">
              {label}
            </Text>
          ) : null}
          {showValue ? (
            <Text className="text-sm text-muted-foreground">{value}</Text>
          ) : null}
        </View>
      ) : null}

      <View
        onLayout={onLayout}
        className="h-10 justify-center"
        {...panResponder.panHandlers}
      >
        {/* Track background */}
        <View className="h-2 rounded-full bg-muted">
          {/* Filled track */}
          <View
            className="h-2 rounded-full bg-primary"
            style={{ width: `${percentage}%` }}
          />
        </View>

        {/* Thumb */}
        <View
          className="absolute h-5 w-5 -translate-y-1/2 rounded-full border-2 border-primary bg-background"
          style={{ left: `${percentage}%`, marginLeft: -10 }}
        />
      </View>
    </View>
  );
};

export default Slider;
