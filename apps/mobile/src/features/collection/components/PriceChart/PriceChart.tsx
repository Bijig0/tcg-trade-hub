import React, { useState, useMemo } from 'react';
import { View, Text, Pressable, useWindowDimensions } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Line, Text as SvgText } from 'react-native-svg';
import filterPriceHistory from '../../utils/filterPriceHistory/filterPriceHistory';
import type { PriceHistory } from '@/services/cardData';
import type { PriceRange } from '../../utils/filterPriceHistory/filterPriceHistory';

type PriceChartProps = {
  priceHistory: PriceHistory | null;
  variantName?: string | null;
};

const CHART_HEIGHT = 200;
const PADDING = { top: 10, right: 12, bottom: 24, left: 52 };

const LINE_COLOR = '#22d3ee';

const RANGES: { key: PriceRange; label: string }[] = [
  { key: '1m', label: '1M' },
  { key: '3m', label: '3M' },
  { key: '6m', label: '6M' },
  { key: '12m', label: '12M' },
  { key: 'max', label: 'MAX' },
];

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Format a YYYY-MM-DD date string as "Jan", "Feb 2025", etc. Show year only for first label or year change. */
const formatXLabel = (dateStr: string, idx: number, allDates: string[]): string => {
  const month = parseInt(dateStr.slice(5, 7), 10) - 1;
  const year = dateStr.slice(0, 4);
  const prevYear = idx > 0 ? allDates[idx - 1]?.slice(0, 4) : null;
  if (idx === 0 || year !== prevYear) {
    return `${MONTH_NAMES[month]} ${year}`;
  }
  return MONTH_NAMES[month] ?? '';
};

/**
 * Collectr-style price chart with SVG line, gradient fill, and time range selector.
 */
const PriceChart: React.FC<PriceChartProps> = ({ priceHistory, variantName }) => {
  const [selectedRange, setSelectedRange] = useState<PriceRange>('3m');
  const { width: screenWidth } = useWindowDimensions();

  const chartWidth = screenWidth - 64; // account for parent px-4 (16*2) + card p-4 (16*2)

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

  const { points, high, low } = filtered;

  const plotWidth = chartWidth - PADDING.left - PADDING.right;
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

  // Select ~4 x-axis labels
  const labelIndices = [0, Math.floor(points.length / 3), Math.floor((2 * points.length) / 3), points.length - 1];
  const allDates = labelIndices.map((idx) => points[idx]?.date ?? '');

  return (
    <View className="rounded-xl bg-card p-4">
      {/* Variant label */}
      {variantName ? (
        <View className="mb-3 flex-row items-center gap-2">
          <View className="h-[3px] w-4 rounded-full" style={{ backgroundColor: LINE_COLOR }} />
          <Text className="text-sm capitalize text-foreground">{variantName}</Text>
        </View>
      ) : null}

      {/* Chart */}
      <Svg width={chartWidth} height={CHART_HEIGHT} viewBox={`0 0 ${chartWidth} ${CHART_HEIGHT}`}>
        <Defs>
          <LinearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={LINE_COLOR} stopOpacity="0.25" />
            <Stop offset="1" stopColor={LINE_COLOR} stopOpacity="0" />
          </LinearGradient>
        </Defs>

        {/* Area fill */}
        <Path d={areaPath} fill="url(#areaGrad)" />

        {/* Line */}
        <Path d={linePath} fill="none" stroke={LINE_COLOR} strokeWidth={2} strokeLinejoin="round" />

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
          fontSize={10}
          fill="#6b7280"
          textAnchor="end"
        >
          ${high.toFixed(2)}
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
          fontSize={10}
          fill="#6b7280"
          textAnchor="end"
        >
          ${low.toFixed(2)}
        </SvgText>

        {/* X-axis labels */}
        {labelIndices.map((idx, i) => {
          const p = points[idx];
          if (!p) return null;
          const label = formatXLabel(p.date, i, allDates);
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
              selectedRange === key ? 'bg-foreground/15' : 'bg-muted'
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                selectedRange === key ? 'text-foreground' : 'text-muted-foreground'
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
