import React, { useState, useMemo } from 'react';
import { View, Text, Pressable } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Line, Text as SvgText } from 'react-native-svg';
import filterPriceHistory from '../../utils/filterPriceHistory/filterPriceHistory';
import type { PriceHistory } from '@/services/cardData';
import type { PriceRange } from '../../utils/filterPriceHistory/filterPriceHistory';

type PriceChartProps = {
  priceHistory: PriceHistory | null;
  currentPrice: number | null;
};

const CHART_WIDTH = 320;
const CHART_HEIGHT = 160;
const PADDING = { top: 10, right: 12, bottom: 24, left: 44 };

const RANGES: { key: PriceRange; label: string }[] = [
  { key: '1m', label: '1M' },
  { key: '3m', label: '3M' },
  { key: '6m', label: '6M' },
  { key: '12m', label: '12M' },
  { key: 'max', label: 'MAX' },
];

/**
 * Collectr-style price chart with SVG line, gradient fill, and time range selector.
 */
const PriceChart: React.FC<PriceChartProps> = ({ priceHistory, currentPrice }) => {
  const [selectedRange, setSelectedRange] = useState<PriceRange>('3m');

  const filtered = useMemo(() => {
    if (!priceHistory) return null;
    return filterPriceHistory(priceHistory.points, selectedRange);
  }, [priceHistory, selectedRange]);

  if (!filtered || filtered.points.length < 2) {
    return (
      <View className="rounded-xl bg-card p-4">
        <Text className="text-sm text-muted-foreground">No price history available</Text>
      </View>
    );
  }

  const { points, high, low, changePercent } = filtered;

  const plotWidth = CHART_WIDTH - PADDING.left - PADDING.right;
  const plotHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom;

  const priceRange = high - low || 1;

  const scaleX = (i: number) =>
    PADDING.left + (i / (points.length - 1)) * plotWidth;
  const scaleY = (price: number) =>
    PADDING.top + plotHeight - ((price - low) / priceRange) * plotHeight;

  // Build SVG path
  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${scaleX(i).toFixed(1)},${scaleY(p.price).toFixed(1)}`)
    .join(' ');

  // Area fill path (line + close to bottom)
  const areaPath = `${linePath} L${scaleX(points.length - 1).toFixed(1)},${(PADDING.top + plotHeight).toFixed(1)} L${PADDING.left},${(PADDING.top + plotHeight).toFixed(1)} Z`;

  const isPositive = changePercent >= 0;
  const lineColor = isPositive ? '#22c55e' : '#ef4444';

  const priceChange = currentPrice != null && points.length >= 2
    ? currentPrice - points[0]!.price
    : null;

  // Select ~4 x-axis labels
  const labelIndices = [0, Math.floor(points.length / 3), Math.floor((2 * points.length) / 3), points.length - 1];

  return (
    <View className="rounded-xl bg-card p-4">
      {/* Price header */}
      {currentPrice != null ? (
        <View className="mb-3">
          <Text className="text-2xl font-bold text-foreground">
            ${currentPrice.toFixed(2)}
          </Text>
          <View className="flex-row items-center gap-1">
            <Text className={`text-sm font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {isPositive ? '\u25B2' : '\u25BC'}
              {priceChange != null ? ` $${Math.abs(priceChange).toFixed(2)}` : ''}
              {` (${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(1)}%)`}
            </Text>
          </View>
        </View>
      ) : null}

      {/* Chart */}
      <Svg width={CHART_WIDTH} height={CHART_HEIGHT} viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}>
        <Defs>
          <LinearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={lineColor} stopOpacity="0.3" />
            <Stop offset="1" stopColor={lineColor} stopOpacity="0.02" />
          </LinearGradient>
        </Defs>

        {/* Area fill */}
        <Path d={areaPath} fill="url(#areaGrad)" />

        {/* Line */}
        <Path d={linePath} fill="none" stroke={lineColor} strokeWidth={2} strokeLinejoin="round" />

        {/* High reference */}
        <Line
          x1={PADDING.left}
          y1={scaleY(high)}
          x2={PADDING.left + plotWidth}
          y2={scaleY(high)}
          stroke="#6b7280"
          strokeWidth={0.5}
          strokeDasharray="4,4"
        />
        <SvgText
          x={PADDING.left - 4}
          y={scaleY(high) + 4}
          fontSize={9}
          fill="#6b7280"
          textAnchor="end"
        >
          ${high.toFixed(0)}
        </SvgText>

        {/* Low reference */}
        <Line
          x1={PADDING.left}
          y1={scaleY(low)}
          x2={PADDING.left + plotWidth}
          y2={scaleY(low)}
          stroke="#6b7280"
          strokeWidth={0.5}
          strokeDasharray="4,4"
        />
        <SvgText
          x={PADDING.left - 4}
          y={scaleY(low) + 4}
          fontSize={9}
          fill="#6b7280"
          textAnchor="end"
        >
          ${low.toFixed(0)}
        </SvgText>

        {/* X-axis labels */}
        {labelIndices.map((idx) => {
          const p = points[idx];
          if (!p) return null;
          const label = p.date.slice(5); // MM-DD
          return (
            <SvgText
              key={idx}
              x={scaleX(idx)}
              y={CHART_HEIGHT - 4}
              fontSize={9}
              fill="#6b7280"
              textAnchor="middle"
            >
              {label}
            </SvgText>
          );
        })}
      </Svg>

      {/* Time range selector */}
      <View className="mt-3 flex-row justify-center gap-2">
        {RANGES.map(({ key, label }) => (
          <Pressable
            key={key}
            onPress={() => setSelectedRange(key)}
            className={`rounded-full px-3 py-1 ${
              selectedRange === key ? 'bg-primary' : 'bg-muted'
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                selectedRange === key ? 'text-primary-foreground' : 'text-muted-foreground'
              }`}
            >
              {label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

export default PriceChart;
