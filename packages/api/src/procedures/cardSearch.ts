import { os } from '../base';
import { TcgTypeSchema, NormalizedCardSchema } from '@tcg-trade-hub/database';
import { z } from 'zod';
import type { NormalizedCard } from '@tcg-trade-hub/database';

type TcgType = z.infer<typeof TcgTypeSchema>;

const MAX_RESULTS = 20;

// ---------------------------------------------------------------------------
// Pokemon TCG API (https://api.pokemontcg.io/v2)
// ---------------------------------------------------------------------------

type PokemonPriceCategory = { market?: number };

type PokemonCard = {
  id: string;
  name: string;
  set: { name: string; id: string };
  number: string;
  images: { small: string; large: string };
  tcgplayer?: {
    prices?: Record<string, PokemonPriceCategory | undefined>;
  };
  cardmarket?: {
    prices?: { averageSellPrice?: number };
  };
  rarity?: string;
};

const extractPokemonPrice = (card: PokemonCard): number | null => {
  const prices = card.tcgplayer?.prices;
  if (prices) {
    for (const category of ['holofoil', 'reverseHolofoil', 'normal']) {
      const market = prices[category]?.market;
      if (typeof market === 'number') return market;
    }
    for (const key of Object.keys(prices)) {
      const market = prices[key]?.market;
      if (typeof market === 'number') return market;
    }
  }
  return card.cardmarket?.prices?.averageSellPrice ?? null;
};

const normalizePokemonCard = (card: PokemonCard): NormalizedCard => ({
  externalId: card.id,
  tcg: 'pokemon',
  name: card.name,
  setName: card.set.name,
  setCode: card.set.id,
  number: card.number,
  imageUrl: card.images.small || card.images.large,
  marketPrice: extractPokemonPrice(card),
  rarity: card.rarity ?? 'Unknown',
});

const searchPokemon = async (query: string): Promise<NormalizedCard[]> => {
  const url = `https://api.pokemontcg.io/v2/cards?q=name:${encodeURIComponent(query)}&pageSize=${MAX_RESULTS}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    throw new Error(`Pokemon TCG API error (${res.status})`);
  }

  const data = (await res.json()) as { data?: PokemonCard[] };
  return (data.data ?? []).map(normalizePokemonCard);
};

// ---------------------------------------------------------------------------
// Scryfall MTG API (https://api.scryfall.com)
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
  const res = await fetch(url);

  if (res.status === 404) return [];
  if (!res.ok) {
    throw new Error(`Scryfall API error (${res.status})`);
  }

  const data = (await res.json()) as { data?: ScryfallCard[] };
  return (data.data ?? []).slice(0, MAX_RESULTS).map(normalizeMtgCard);
};

// ---------------------------------------------------------------------------
// One Piece — Scrydex API (https://api.scrydex.com/onepiece/v1)
// ---------------------------------------------------------------------------

type OnePieceCard = {
  id: string;
  name: string;
  number: string;
  rarity: string;
  images?: Array<{ small?: string; medium?: string; large?: string }>;
  expansion?: { name: string; code: string };
  prices?: Array<{ variant: string; market?: number }>;
};

const normalizeOnePieceCard = (card: OnePieceCard): NormalizedCard => {
  const image = card.images?.[0];
  const price = card.prices?.find((p) => p.variant === 'normal') ?? card.prices?.[0];
  return {
    externalId: card.id,
    tcg: 'onepiece',
    name: card.name,
    setName: card.expansion?.name ?? 'Unknown Set',
    setCode: card.expansion?.code ?? 'N/A',
    number: card.number ?? card.id,
    imageUrl: image?.medium ?? image?.small ?? '',
    marketPrice: price?.market ?? null,
    rarity: card.rarity ?? 'Unknown',
  };
};

const searchOnePiece = async (query: string): Promise<NormalizedCard[]> => {
  const apiKey = process.env.SCRYDEX_API_KEY;
  const teamId = process.env.SCRYDEX_TEAM_ID;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (apiKey) headers['X-Api-Key'] = apiKey;
  if (teamId) headers['X-Team-ID'] = teamId;

  const url = `https://api.scrydex.com/onepiece/v1/cards?q=name:${encodeURIComponent(query)}&page_size=${MAX_RESULTS}&select=id,name,number,rarity,images,expansion&include=prices`;
  const res = await fetch(url, { headers });

  if (res.status === 404) return [];
  if (!res.ok) {
    throw new Error(`Scrydex One Piece API error (${res.status})`);
  }

  const data = (await res.json()) as { data?: OnePieceCard[] };
  return (data.data ?? []).map(normalizeOnePieceCard);
};

// ---------------------------------------------------------------------------
// Router map
// ---------------------------------------------------------------------------

const searchByTcg: Record<TcgType, (query: string) => Promise<NormalizedCard[]>> = {
  pokemon: searchPokemon,
  mtg: searchMtg,
  onepiece: searchOnePiece,
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
