import { os } from '../base';
import { TcgTypeSchema, NormalizedCardSchema } from '@tcg-trade-hub/database';
import { z } from 'zod';
import type { NormalizedCard } from '@tcg-trade-hub/database';

type TcgType = z.infer<typeof TcgTypeSchema>;

const MAX_RESULTS = 20;
const FETCH_TIMEOUT_MS = 10_000;

// ---------------------------------------------------------------------------
// Scrydex API (Pokemon, One Piece) — requires SCRYDEX_API_KEY + SCRYDEX_TEAM_ID
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

  const url = `https://api.scrydex.com/${tcg}/v1/cards?q=name:${encodeURIComponent(query)}*&page_size=${MAX_RESULTS}&select=id,name,number,rarity,images,expansion&include=prices`;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey,
        'X-Team-ID': teamId,
      },
    });
    clearTimeout(timer);

    if (res.status === 404) return [];
    if (!res.ok) {
      console.warn(`[cardSearch] Scrydex ${tcg} API error (${res.status})`);
      return [];
    }

    const data = (await res.json()) as { data?: ScrydexCard[] };
    return (data.data ?? []).map((card) => normalizeScrydexCard(card, tcg));
  } catch (err) {
    console.warn(`[cardSearch] Scrydex ${tcg} fetch failed:`, err);
    return [];
  }
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
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);

    if (res.status === 404) return [];
    if (!res.ok) {
      console.warn(`[cardSearch] Scryfall API error (${res.status})`);
      return [];
    }

    const data = (await res.json()) as { data?: ScryfallCard[] };
    return (data.data ?? []).slice(0, MAX_RESULTS).map(normalizeMtgCard);
  } catch (err) {
    console.warn('[cardSearch] Scryfall fetch failed:', err);
    return [];
  }
};

// ---------------------------------------------------------------------------
// Router map
// ---------------------------------------------------------------------------

const searchByTcg: Record<TcgType, (query: string) => Promise<NormalizedCard[]>> = {
  pokemon: (query) => searchScrydex(query, 'pokemon'),
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
