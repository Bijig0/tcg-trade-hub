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
// TCGdex Pokemon API (https://tcgdex.dev) — free, no key required
// ---------------------------------------------------------------------------

type TCGdexCardBrief = {
  id: string;
  localId: string;
  name: string;
  image: string;
};

const normalizeTCGdexCard = (card: TCGdexCardBrief): NormalizedCard => {
  const dashIdx = card.id.lastIndexOf('-');
  const setCode = dashIdx > 0 ? card.id.slice(0, dashIdx) : card.id;

  return {
    externalId: card.id,
    tcg: 'pokemon',
    name: card.name,
    setName: setCode,
    setCode,
    number: card.localId,
    imageUrl: `${card.image}/high.webp`,
    marketPrice: null,
    rarity: 'Unknown',
  };
};

const searchPokemon = async (query: string): Promise<NormalizedCard[]> => {
  const url = `https://api.tcgdex.net/v2/en/cards?name=${encodeURIComponent(query)}&pagination:itemsPerPage=${MAX_RESULTS}`;
  const res = await fetchWithTimeout(url);

  if (res.status === 404) return [];
  if (!res.ok) {
    throw new Error(`TCGdex API error (${res.status})`);
  }

  const cards = (await res.json()) as TCGdexCardBrief[];
  return cards.slice(0, MAX_RESULTS).map(normalizeTCGdexCard);
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
  onepiece: async () => [],
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
