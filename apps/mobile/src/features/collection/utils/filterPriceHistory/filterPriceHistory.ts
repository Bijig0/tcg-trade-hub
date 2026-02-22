import type { PricePoint, PriceHistory } from '@/services/cardData';

export type PriceRange = '1m' | '3m' | '6m' | '12m' | 'max';

/**
 * Filters price history points by time range and recalculates summary stats.
 * Returns a new PriceHistory with only points within the selected range.
 */
const filterPriceHistory = (
  points: PricePoint[],
  range: PriceRange,
): PriceHistory => {
  if (points.length === 0) {
    return { points: [], high: 0, low: 0, changePercent: 0 };
  }

  const now = new Date();
  let filtered: PricePoint[];

  if (range === 'max') {
    filtered = points;
  } else {
    const monthsMap: Record<Exclude<PriceRange, 'max'>, number> = {
      '1m': 1,
      '3m': 3,
      '6m': 6,
      '12m': 12,
    };
    const months = monthsMap[range];
    const cutoff = new Date(now);
    cutoff.setMonth(cutoff.getMonth() - months);
    const cutoffStr = cutoff.toISOString().slice(0, 10);

    filtered = points.filter((p) => p.date >= cutoffStr);
  }

  if (filtered.length === 0) {
    return { points: [], high: 0, low: 0, changePercent: 0 };
  }

  const prices = filtered.map((p) => p.price);
  const high = Math.max(...prices);
  const low = Math.min(...prices);

  const firstPrice = filtered[0]!.price;
  const lastPrice = filtered[filtered.length - 1]!.price;
  const changePercent = firstPrice !== 0
    ? ((lastPrice - firstPrice) / firstPrice) * 100
    : 0;

  return { points: filtered, high, low, changePercent };
};

export default filterPriceHistory;
