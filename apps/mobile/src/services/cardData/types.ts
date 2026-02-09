import type { NormalizedCard } from '@tcg-trade-hub/database';

/**
 * Price data from a single marketplace variant (e.g. normal, holofoil).
 */
export type PriceVariant = {
  low: number | null;
  mid: number | null;
  high: number | null;
  market: number | null;
};

/**
 * Aggregated price data across marketplaces.
 */
export type PriceData = {
  /** Keyed by variant name (e.g. 'normal', 'holofoil', 'reverseHolofoil') */
  variants: Record<string, PriceVariant>;
  /** Average sell price across sources */
  averageSellPrice: number | null;
  /** Current trend price */
  trendPrice: number | null;
};

/**
 * Extended card detail with prices, art, and gameplay info.
 */
export type CardDetail = NormalizedCard & {
  prices: PriceData | null;
  artist: string | null;
  types: string[];
  hp: string | null;
  largeImageUrl: string;
};

/**
 * Set info for browse/filter.
 */
export type SetInfo = {
  id: string;
  name: string;
  code: string;
  releaseDate: string;
  totalCards: number;
  logoUrl: string | null;
};

/**
 * Adapter function signature for searching cards.
 * Any data source (Scrydex, pokemontcg.io, mock) must match this shape.
 */
export type SearchCardsAdapter = (
  query: string,
  tcg: string,
  setCode?: string,
) => Promise<NormalizedCard[]>;

/**
 * Adapter function signature for fetching a single card's full detail.
 */
export type GetCardDetailAdapter = (
  externalId: string,
) => Promise<CardDetail | null>;

/**
 * Adapter function signature for searching sets.
 */
export type SearchSetsAdapter = (
  query: string,
  tcg: string,
) => Promise<SetInfo[]>;

/**
 * Bundle of all adapter functions for a card data source.
 */
export type CardDataAdapter = {
  searchCards: SearchCardsAdapter;
  getCardDetail: GetCardDetailAdapter;
  searchSets: SearchSetsAdapter;
};
