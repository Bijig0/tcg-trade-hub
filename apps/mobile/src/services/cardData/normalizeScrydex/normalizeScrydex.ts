import type { TcgType, NormalizedCard } from '@tcg-trade-hub/database';
import type { CardDetail, PriceData, PriceHistory, PricePoint } from '../types';

// ---------------------------------------------------------------------------
// Scrydex API response shapes
// ---------------------------------------------------------------------------

export type ScrydexImage = {
  small?: string;
  medium?: string;
  large?: string;
};

export type ScrydexExpansion = {
  name: string;
  code: string;
};

export type ScrydexPrice = {
  variant: string;
  low?: number | null;
  mid?: number | null;
  high?: number | null;
  market?: number | null;
};

export type ScrydexTrend = {
  date: string;
  price: number;
};

export type ScrydexCard = {
  id: string;
  name: string;
  number: string;
  rarity: string;
  images?: ScrydexImage[];
  expansion?: ScrydexExpansion;
  prices?: ScrydexPrice[];
  trends?: ScrydexTrend[];
  artist?: string;
  types?: string[];
  hp?: string;
  colors?: string[];
  mana_value?: number;
  ink_types?: string[];
  cost?: number;
};

// ---------------------------------------------------------------------------
// TCG path mapping
// ---------------------------------------------------------------------------

const SCRYDEX_TCG_PATHS: Record<string, string> = {
  pokemon: 'pokemon',
  mtg: 'magicthegathering',
  onepiece: 'onepiece',
};

/**
 * Returns the Scrydex API path segment for a given TCG.
 */
export const getScrydexTcgPath = (tcg: string): string =>
  SCRYDEX_TCG_PATHS[tcg] ?? tcg;

// ---------------------------------------------------------------------------
// Normalization: ScrydexCard -> NormalizedCard
// ---------------------------------------------------------------------------

/**
 * Extracts the best image URL from a Scrydex card's images array.
 * Prefers medium, falls back to small, then large.
 */
export const extractScrydexImage = (images?: ScrydexImage[]): string => {
  const img = images?.[0];
  if (!img) return '';
  return img.medium ?? img.small ?? img.large ?? '';
};

/**
 * Extracts the best large image URL from a Scrydex card's images array.
 * Prefers large, falls back to medium, then small.
 */
export const extractScrydexLargeImage = (images?: ScrydexImage[]): string => {
  const img = images?.[0];
  if (!img) return '';
  return img.large ?? img.medium ?? img.small ?? '';
};

/**
 * Extracts the market price from the NM (or first) price variant.
 */
export const extractScrydexMarketPrice = (
  prices?: ScrydexPrice[],
): number | null => {
  if (!prices || prices.length === 0) return null;
  const nm = prices.find(
    (p) => p.variant.toLowerCase() === 'normal' || p.variant.toLowerCase() === 'nm',
  );
  const price = nm ?? prices[0];
  return price?.market ?? null;
};

/**
 * Normalizes a Scrydex card response into a NormalizedCard.
 */
export const normalizeScrydexCard = (
  card: ScrydexCard,
  tcg: TcgType,
): NormalizedCard => ({
  externalId: card.id,
  tcg,
  name: card.name,
  setName: card.expansion?.name ?? 'Unknown Set',
  setCode: card.expansion?.code ?? 'N/A',
  number: card.number ?? card.id,
  imageUrl: extractScrydexImage(card.images),
  marketPrice: extractScrydexMarketPrice(card.prices),
  rarity: card.rarity ?? 'Unknown',
});

// ---------------------------------------------------------------------------
// Normalization: ScrydexCard -> CardDetail
// ---------------------------------------------------------------------------

/**
 * Builds PriceData from Scrydex price variants.
 */
export const buildPriceData = (prices?: ScrydexPrice[]): PriceData | null => {
  if (!prices || prices.length === 0) return null;

  const variants: PriceData['variants'] = {};
  for (const p of prices) {
    variants[p.variant] = {
      low: p.low ?? null,
      mid: p.mid ?? null,
      high: p.high ?? null,
      market: p.market ?? null,
    };
  }

  const firstMarket = prices[0]?.market ?? null;

  return {
    variants,
    averageSellPrice: firstMarket,
    trendPrice: firstMarket,
  };
};

/**
 * Builds PriceHistory from Scrydex trend data.
 */
export const buildPriceHistory = (
  trends?: ScrydexTrend[],
): PriceHistory | null => {
  if (!trends || trends.length === 0) return null;

  const points: PricePoint[] = trends.map((t) => ({
    date: t.date,
    price: t.price,
  }));

  const allPrices = points.map((p) => p.price);
  const high = Math.max(...allPrices);
  const low = Math.min(...allPrices);
  const first = allPrices[0] ?? 0;
  const last = allPrices[allPrices.length - 1] ?? 0;
  const changePercent = first > 0 ? ((last - first) / first) * 100 : 0;

  return { points, high, low, changePercent };
};

/**
 * Normalizes a Scrydex card response into a full CardDetail.
 */
export const normalizeScrydexCardDetail = (
  card: ScrydexCard,
  tcg: TcgType,
): CardDetail => ({
  ...normalizeScrydexCard(card, tcg),
  largeImageUrl: extractScrydexLargeImage(card.images),
  artist: card.artist ?? null,
  types: card.types ?? card.colors ?? card.ink_types ?? [],
  hp: card.hp ?? null,
  prices: buildPriceData(card.prices),
  priceHistory: buildPriceHistory(card.trends),
});
