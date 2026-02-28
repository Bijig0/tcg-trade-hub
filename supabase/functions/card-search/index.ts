/**
 * card-search Edge Function
 *
 * POST { tcg: 'pokemon' | 'mtg' | 'onepiece', query: string }
 * Returns { cards: NormalizedCard[] }
 *
 * Proxies to the appropriate external card API and normalizes results.
 */
import { handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts';
import {
  type NormalizedCard,
  normalizePokemonCard,
  normalizeMtgCard,
  normalizeOnePieceCard,
} from '../_shared/normalizeCard.ts';
import { cacheCardImages } from '../_shared/cacheCardImage.ts';

const VALID_TCGS = ['pokemon', 'mtg', 'onepiece'] as const;
type TcgType = (typeof VALID_TCGS)[number];

// Max results to return per search
const MAX_RESULTS = 20;

async function searchPokemon(query: string): Promise<NormalizedCard[]> {
  const apiKey = Deno.env.get('POKEMON_TCG_API_KEY');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (apiKey) {
    headers['X-Api-Key'] = apiKey;
  }

  const url = `https://api.pokemontcg.io/v2/cards?q=name:${encodeURIComponent(query)}&pageSize=${MAX_RESULTS}`;
  const res = await fetch(url, { headers });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Pokemon TCG API error (${res.status}): ${text}`);
  }

  const data = await res.json();
  const cards = data.data ?? [];
  return cards.map(normalizePokemonCard);
}

async function searchMtg(query: string): Promise<NormalizedCard[]> {
  const url = `https://api.scryfall.com/cards/search?q=${encodeURIComponent(query)}&unique=prints&order=released&dir=desc`;
  const res = await fetch(url);

  if (res.status === 404) {
    // Scryfall returns 404 when no cards match
    return [];
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Scryfall API error (${res.status}): ${text}`);
  }

  const data = await res.json();
  const cards = (data.data ?? []).slice(0, MAX_RESULTS);
  return cards.map(normalizeMtgCard);
}

async function searchOnePiece(query: string): Promise<NormalizedCard[]> {
  const apiKey = Deno.env.get('SCRYDEX_API_KEY');
  const teamId = Deno.env.get('SCRYDEX_TEAM_ID');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (apiKey) headers['X-Api-Key'] = apiKey;
  if (teamId) headers['X-Team-ID'] = teamId;

  const url = `https://api.scrydex.com/onepiece/v1/cards?q=name:${encodeURIComponent(query)}&page_size=${MAX_RESULTS}&select=id,name,number,rarity,images,expansion&include=prices`;
  const res = await fetch(url, { headers });

  if (!res.ok) {
    if (res.status === 404) return [];
    const text = await res.text();
    throw new Error(`Scrydex One Piece API error (${res.status}): ${text}`);
  }

  const data = await res.json();
  const cards = data.data ?? [];
  return cards.map(normalizeOnePieceCard);
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return handleCors();

  try {
    if (req.method !== 'POST') {
      return errorResponse('Method not allowed', 405);
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return errorResponse('Invalid JSON body');
    }

    const { tcg, query } = body as { tcg?: string; query?: string };

    // Validate tcg
    if (!tcg || !VALID_TCGS.includes(tcg as TcgType)) {
      return errorResponse(
        `Invalid tcg. Must be one of: ${VALID_TCGS.join(', ')}`,
      );
    }

    // Validate query
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return errorResponse('query is required and must be a non-empty string');
    }

    const trimmedQuery = query.trim();
    if (trimmedQuery.length > 200) {
      return errorResponse('query must be 200 characters or fewer');
    }

    let cards: NormalizedCard[];

    switch (tcg as TcgType) {
      case 'pokemon':
        cards = await searchPokemon(trimmedQuery);
        break;
      case 'mtg':
        cards = await searchMtg(trimmedQuery);
        break;
      case 'onepiece':
        cards = await searchOnePiece(trimmedQuery);
        break;
      default:
        cards = [];
    }

    // Cache card images into Supabase Storage
    const urlMap = await cacheCardImages(
      cards.map((c) => ({ tcg: c.tcg, externalId: c.externalId, imageUrl: c.imageUrl })),
    );
    const cachedCards = cards.map((card) => ({
      ...card,
      imageUrl: urlMap.get(card.externalId) ?? card.imageUrl,
    }));

    return jsonResponse({ cards: cachedCards });
  } catch (err) {
    console.error('card-search error:', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return errorResponse(message, 500);
  }
});
