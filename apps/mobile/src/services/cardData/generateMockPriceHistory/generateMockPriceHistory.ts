import type { PriceHistory, PricePoint } from '../types';

/**
 * Simple seeded PRNG (mulberry32) for deterministic output.
 * Same marketPrice always produces the same price history.
 */
const createSeededRandom = (seed: number) => {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/**
 * Generates a deterministic mock price history using a seeded random walk.
 *
 * Starts at ~85% of marketPrice and trends toward it over the given number
 * of days. Daily changes are bounded to +/- 2%. The seed is derived from
 * marketPrice so the same card always produces the same chart.
 *
 * @param marketPrice - The current market price to trend toward
 * @param days - Number of days of history to generate (default 365)
 */
const generateMockPriceHistory = (
  marketPrice: number,
  days = 365,
): PriceHistory => {
  if (marketPrice <= 0 || days <= 0) {
    return { points: [], high: 0, low: 0, changePercent: 0 };
  }

  const seed = Math.round(marketPrice * 100);
  const random = createSeededRandom(seed);

  const points: PricePoint[] = [];
  const today = new Date();
  let price = marketPrice * 0.85;
  let high = price;
  let low = price;

  // bias toward ending at marketPrice
  const dailyBias = (marketPrice - price) / days;

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0]!;

    points.push({ date: dateStr, price: Math.round(price * 100) / 100 });

    if (price > high) high = price;
    if (price < low) low = price;

    // random walk: +/- 2% plus small bias toward market price
    const change = (random() - 0.5) * 0.04 * price + dailyBias;
    price = Math.max(price + change, marketPrice * 0.3); // floor at 30% of market
  }

  high = Math.round(high * 100) / 100;
  low = Math.round(low * 100) / 100;

  const firstPrice = points[0]?.price ?? marketPrice;
  const lastPrice = points[points.length - 1]?.price ?? marketPrice;
  const changePercent =
    firstPrice > 0
      ? Math.round(((lastPrice - firstPrice) / firstPrice) * 10000) / 100
      : 0;

  return { points, high, low, changePercent };
};

export default generateMockPriceHistory;
