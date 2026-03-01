import { os } from '../base';
import { TcgTypeSchema, NormalizedCardSchema } from '@tcg-trade-hub/database';
import { z } from 'zod';
import type { NormalizedCard } from '@tcg-trade-hub/database';

type TcgType = z.infer<typeof TcgTypeSchema>;

const MAX_RESULTS = 20;
const FETCH_TIMEOUT_MS = 8_000;

const fetchWithTimeout = async (
  url: string,
  init?: RequestInit,
): Promise<Response> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
};

// ---------------------------------------------------------------------------
// PokéWallet API (Pokemon) — 10K req/month free tier
// https://pokewallet.io/api-docs
// Images sourced from TCGPlayer CDN via product ID
// ---------------------------------------------------------------------------

type PokeWalletPriceEntry = {
  low_price: number | null;
  mid_price: number | null;
  high_price: number | null;
  market_price: number | null;
  direct_low_price: number | null;
  sub_type_name: string;
  updated_at: string;
};

type PokeWalletCardMarketPrice = {
  avg: number | null;
  low: number | null;
  avg1: number | null;
  avg7: number | null;
  avg30: number | null;
  trend: number | null;
  variant_type: string;
  updated_at: string;
};

type PokeWalletCard = {
  id: string;
  card_info: {
    name: string;
    clean_name: string;
    set_name: string;
    set_code: string;
    set_id: string;
    card_number: string | null;
    rarity: string | null;
    card_type: string | null;
    hp: string | null;
    stage: string | null;
    card_text: string | null;
    attacks: string[];
    weakness: string | null;
    resistance: string | null;
    retreat_cost: string | null;
  };
  tcgplayer: {
    prices: PokeWalletPriceEntry[];
    url: string;
  } | null;
  cardmarket: {
    product_name: string;
    prices: PokeWalletCardMarketPrice[];
    product_url: string;
  } | null;
};

/** Extract TCGPlayer product ID from URL to construct CDN image URL. */
const extractTcgPlayerImageUrl = (tcgplayerUrl: string | undefined): string => {
  if (!tcgplayerUrl) return '';
  const match = tcgplayerUrl.match(/\/product\/(\d+)/);
  if (!match?.[1]) return '';
  return `https://product-images.tcgplayer.com/fit-in/437x437/${match[1]}.jpg`;
};

const extractPokeWalletPrice = (card: PokeWalletCard): number | null => {
  if (card.tcgplayer?.prices?.length) {
    for (const entry of card.tcgplayer.prices) {
      if (entry.market_price != null) return entry.market_price;
    }
    for (const entry of card.tcgplayer.prices) {
      if (entry.mid_price != null) return entry.mid_price;
    }
  }
  if (card.cardmarket?.prices?.length) {
    for (const entry of card.cardmarket.prices) {
      if (entry.avg != null) return entry.avg;
    }
  }
  return null;
};

const normalizePokeWalletCard = (card: PokeWalletCard): NormalizedCard => ({
  externalId: card.id,
  tcg: 'pokemon',
  name: card.card_info.name,
  setName: card.card_info.set_name,
  setCode: card.card_info.set_code,
  number: card.card_info.card_number ?? '',
  imageUrl: extractTcgPlayerImageUrl(card.tcgplayer?.url),
  marketPrice: extractPokeWalletPrice(card),
  rarity: card.card_info.rarity ?? 'Unknown',
});

const searchPokemon = async (query: string): Promise<NormalizedCard[]> => {
  const apiKey = process.env.POKEWALLET_API_KEY;
  if (!apiKey) {
    console.warn('[cardSearch] POKEWALLET_API_KEY not set — Pokemon search unavailable');
    return [];
  }

  const url = `https://api.pokewallet.io/search?q=${encodeURIComponent(query)}&limit=${MAX_RESULTS}`;
  const res = await fetchWithTimeout(url, {
    headers: { 'X-API-Key': apiKey },
  });

  if (res.status === 404) return [];
  if (!res.ok) {
    throw new Error(`PokéWallet API error (${res.status})`);
  }

  const data = (await res.json()) as { results?: PokeWalletCard[] };
  return (data.results ?? [])
    .filter((card) => card.card_info.card_number != null)
    .map(normalizePokeWalletCard);
};

// ---------------------------------------------------------------------------
// Scrydex API (One Piece) — requires SCRYDEX_API_KEY + SCRYDEX_TEAM_ID
// https://api.scrydex.com/{tcg}/v1
// ---------------------------------------------------------------------------

type ScrydexImage = {
  type?: string;
  small?: string;
  medium?: string;
  large?: string;
};

type ScrydexExpansion = {
  id?: string;
  name: string;
  code: string;
};

type ScrydexPrice = {
  variant: string;
  market?: number | null;
};

type ScrydexCard = {
  id: string;
  name: string;
  number: string;
  rarity: string;
  images?: ScrydexImage[];
  expansion?: ScrydexExpansion;
  prices?: ScrydexPrice[];
};

const normalizeScrydexCard = (card: ScrydexCard, tcg: TcgType): NormalizedCard => {
  const image = card.images?.[0];
  const price =
    card.prices?.find((p) => p.variant === 'normal' || p.variant === 'nm') ??
    card.prices?.[0];
  return {
    externalId: card.id,
    tcg,
    name: card.name,
    setName: card.expansion?.name ?? 'Unknown Set',
    setCode: card.expansion?.code ?? 'N/A',
    number: card.number ?? card.id,
    imageUrl: image?.medium ?? image?.small ?? image?.large ?? '',
    marketPrice: price?.market ?? null,
    rarity: card.rarity ?? 'Unknown',
  };
};

const searchScrydex = async (
  query: string,
  tcg: TcgType,
): Promise<NormalizedCard[]> => {
  const apiKey = process.env.SCRYDEX_API_KEY;
  const teamId = process.env.SCRYDEX_TEAM_ID;

  if (!apiKey || !teamId) {
    console.warn(`[cardSearch] SCRYDEX_API_KEY or SCRYDEX_TEAM_ID not set — ${tcg} search unavailable`);
    return [];
  }

  const url = `https://api.scrydex.com/onepiece/v1/cards?q=name:${encodeURIComponent(query)}*&page_size=${MAX_RESULTS}&select=id,name,number,rarity,images,expansion&include=prices`;
  const res = await fetchWithTimeout(url, {
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': apiKey,
      'X-Team-ID': teamId,
    },
  });

  if (res.status === 404) return [];
  if (!res.ok) {
    throw new Error(`Scrydex ${tcg} API error (${res.status})`);
  }

  const data = (await res.json()) as { data?: ScrydexCard[] };
  return (data.data ?? []).map((card) => normalizeScrydexCard(card, tcg));
};

// ---------------------------------------------------------------------------
// Scryfall MTG API (https://api.scryfall.com) — free, no key required
// ---------------------------------------------------------------------------

type ScryfallImageUris = {
  normal?: string;
  large?: string;
  small?: string;
  png?: string;
};

type ScryfallCard = {
  id: string;
  name: string;
  set_name: string;
  set: string;
  collector_number: string;
  image_uris?: ScryfallImageUris;
  card_faces?: Array<{ image_uris?: ScryfallImageUris }>;
  prices: {
    usd?: string | null;
    usd_foil?: string | null;
    eur?: string | null;
  };
  rarity: string;
};

const extractScryfallImage = (card: ScryfallCard): string => {
  if (card.image_uris) {
    return card.image_uris.normal || card.image_uris.small || card.image_uris.large || '';
  }
  if (card.card_faces && card.card_faces.length > 0) {
    const face = card.card_faces[0];
    if (face?.image_uris) {
      return face.image_uris.normal || face.image_uris.small || face.image_uris.large || '';
    }
  }
  return '';
};

const normalizeMtgCard = (card: ScryfallCard): NormalizedCard => {
  const priceStr = card.prices.usd ?? card.prices.usd_foil ?? card.prices.eur ?? null;
  return {
    externalId: card.id,
    tcg: 'mtg',
    name: card.name,
    setName: card.set_name,
    setCode: card.set.toUpperCase(),
    number: card.collector_number,
    imageUrl: extractScryfallImage(card),
    marketPrice: priceStr ? parseFloat(priceStr) : null,
    rarity: card.rarity ?? 'Unknown',
  };
};

const searchMtg = async (query: string): Promise<NormalizedCard[]> => {
  const url = `https://api.scryfall.com/cards/search?q=${encodeURIComponent(query)}&unique=prints&order=released&dir=desc`;
  const res = await fetchWithTimeout(url);

  if (res.status === 404) return [];
  if (!res.ok) {
    throw new Error(`Scryfall API error (${res.status})`);
  }

  const data = (await res.json()) as { data?: ScryfallCard[] };
  return (data.data ?? []).slice(0, MAX_RESULTS).map(normalizeMtgCard);
};

// ---------------------------------------------------------------------------
// Router map
// ---------------------------------------------------------------------------

const searchByTcg: Record<TcgType, (query: string) => Promise<NormalizedCard[]>> = {
  pokemon: searchPokemon,
  mtg: searchMtg,
  onepiece: (query) => searchScrydex(query, 'onepiece'),
};

// ---------------------------------------------------------------------------
// oRPC procedure
// ---------------------------------------------------------------------------

export const search = os
  .input(z.object({ query: z.string().min(1), tcg: TcgTypeSchema }))
  .output(z.array(NormalizedCardSchema))
  .handler(async ({ input }) => {
    const searchFn = searchByTcg[input.tcg];
    return searchFn(input.query.trim());
  });
