import React, { useCallback, useMemo, useState } from 'react';
import { View, Text } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Line, Circle, Rect } from 'react-native-svg';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import type { PriceHistory } from '@/services/cardData/types';

type PriceChartProps = {
  priceHistory: PriceHistory;
  height?: number;
  /** Show high/low dashed lines and price labels */
  showLabels?: boolean;
};

const PADDING_LEFT = 0;
const PADDING_RIGHT = 0;
const PADDING_TOP = 4;
const PADDING_BOTTOM = 4;

/**
 * SVG line chart for price history with gradient fill.
 * Green gradient for positive change, red for negative.
 * Optional touch crosshair on press-and-hold.
 */
const PriceChart = ({
  priceHistory,
  height = 80,
  showLabels = false,
}: PriceChartProps) => {
  const [containerWidth, setContainerWidth] = useState(0);
  const [touchIndex, setTouchIndex] = useState<number | null>(null);

  const { points, high, low, changePercent } = priceHistory;
  const isPositive = changePercent >= 0;
  const strokeColor = isPositive ? '#22c55e' : '#ef4444';
  const gradientId = isPositive ? 'greenGrad' : 'redGrad';

  const labelWidth = showLabels ? 52 : 0;
  const chartWidth = containerWidth - labelWidth;

  const chartData = useMemo(() => {
    if (points.length < 2 || chartWidth <= 0) return null;

    const xStep = (chartWidth - PADDING_LEFT - PADDING_RIGHT) / (points.length - 1);
    const range = high - low || 1;
    const chartH = height - PADDING_TOP - PADDING_BOTTOM;

    const coords = points.map((p, i) => ({
      x: PADDING_LEFT + i * xStep,
      y: PADDING_TOP + chartH - ((p.price - low) / range) * chartH,
    }));

    // SVG path for the line
    const linePath = coords
      .map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(2)} ${c.y.toFixed(2)}`)
      .join(' ');

    // Closed path for gradient fill area
    const fillPath =
      linePath +
      ` L ${coords[coords.length - 1]!.x.toFixed(2)} ${height} L ${coords[0]!.x.toFixed(2)} ${height} Z`;

    // Dashed line Y positions
    const highY = PADDING_TOP;
    const lowY = PADDING_TOP + chartH;

    return { coords, linePath, fillPath, highY, lowY, xStep };
  }, [points, chartWidth, height, high, low]);

  const panGesture = Gesture.Pan()
    .onStart((e) => {
      if (!chartData) return;
      const idx = Math.round((e.x - PADDING_LEFT) / chartData.xStep);
      setTouchIndex(Math.max(0, Math.min(idx, points.length - 1)));
    })
    .onUpdate((e) => {
      if (!chartData) return;
      const idx = Math.round((e.x - PADDING_LEFT) / chartData.xStep);
      setTouchIndex(Math.max(0, Math.min(idx, points.length - 1)));
    })
    .onEnd(() => setTouchIndex(null))
    .onFinalize(() => setTouchIndex(null));

  const handleLayout = useCallback(
    (e: { nativeEvent: { layout: { width: number } } }) => {
      setContainerWidth(e.nativeEvent.layout.width);
    },
    [],
  );

  if (points.length < 2) return null;

  const touchPoint =
    touchIndex != null && chartData?.coords[touchIndex]
      ? { ...chartData.coords[touchIndex]!, point: points[touchIndex]! }
      : null;

  return (
    <View onLayout={handleLayout}>
      {containerWidth > 0 && chartData && (
        <View className="flex-row">
          <GestureDetector gesture={panGesture}>
            <View style={{ width: chartWidth, height }}>
              <Svg width={chartWidth} height={height}>
                <Defs>
                  <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0" stopColor={strokeColor} stopOpacity={0.25} />
                    <Stop offset="1" stopColor={strokeColor} stopOpacity={0.02} />
                  </LinearGradient>
                </Defs>

                {/* Gradient fill */}
                <Path d={chartData.fillPath} fill={`url(#${gradientId})`} />

                {/* Price line */}
                <Path
                  d={chartData.linePath}
                  stroke={strokeColor}
                  strokeWidth={1.5}
                  fill="none"
                />

                {/* High/low dashed lines */}
                {showLabels && (
                  <>
                    <Line
                      x1={0}
                      y1={chartData.highY}
                      x2={chartWidth}
                      y2={chartData.highY}
                      stroke="#71717a"
                      strokeWidth={0.5}
                      strokeDasharray="4 3"
                    />
                    <Line
                      x1={0}
                      y1={chartData.lowY}
                      x2={chartWidth}
                      y2={chartData.lowY}
                      stroke="#71717a"
                      strokeWidth={0.5}
                      strokeDasharray="4 3"
                    />
                  </>
                )}

                {/* Touch crosshair */}
                {touchPoint && (
                  <>
                    <Line
                      x1={touchPoint.x}
                      y1={0}
                      x2={touchPoint.x}
                      y2={height}
                      stroke="#a1a1aa"
                      strokeWidth={0.5}
                      strokeDasharray="2 2"
                    />
                    <Circle
                      cx={touchPoint.x}
                      cy={touchPoint.y}
                      r={3.5}
                      fill={strokeColor}
                      stroke="#fff"
                      strokeWidth={1.5}
                    />
                    {/* Price tooltip background */}
                    <Rect
                      x={Math.max(
                        0,
                        Math.min(touchPoint.x - 32, chartWidth - 64),
                      )}
                      y={Math.max(0, touchPoint.y - 24)}
                      width={64}
                      height={16}
                      rx={4}
                      fill="#18181b"
                      opacity={0.85}
                    />
                  </>
                )}
              </Svg>

              {/* Touch price label (rendered outside SVG for better text) */}
              {touchPoint && (
                <View
                  style={{
                    position: 'absolute',
                    left: Math.max(
                      0,
                      Math.min(touchPoint.x - 32, chartWidth - 64),
                    ),
                    top: Math.max(0, touchPoint.y - 24),
                    width: 64,
                    height: 16,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  pointerEvents="none"
                >
                  <Text
                    className="text-center text-[10px] font-semibold text-white"
                    numberOfLines={1}
                  >
                    ${touchPoint.point.price.toFixed(2)}
                  </Text>
                </View>
              )}
            </View>
          </GestureDetector>

          {/* Side labels for high/low */}
          {showLabels && (
            <View
              style={{ width: labelWidth, height }}
              className="justify-between pl-1"
            >
              <Text className="text-[10px] text-muted-foreground">
                ${high.toFixed(2)}
              </Text>
              <Text className="text-[10px] text-muted-foreground">
                ${low.toFixed(2)}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default PriceChart;
