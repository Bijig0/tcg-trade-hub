/**
 * card-details Edge Function
 *
 * POST { tcg: 'pokemon' | 'mtg' | 'yugioh', externalId: string }
 * Returns { card: NormalizedCard }
 *
 * Fetches a single card's details from the appropriate external API.
 */
import { handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts';
import {
  type NormalizedCard,
  normalizePokemonCard,
  normalizeMtgCard,
  normalizeYugiohCard,
} from '../_shared/normalizeCard.ts';

const VALID_TCGS = ['pokemon', 'mtg', 'yugioh'] as const;
type TcgType = (typeof VALID_TCGS)[number];

async function fetchPokemonCard(externalId: string): Promise<NormalizedCard> {
  const apiKey = Deno.env.get('POKEMON_TCG_API_KEY');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (apiKey) {
    headers['X-Api-Key'] = apiKey;
  }

  const url = `https://api.pokemontcg.io/v2/cards/${encodeURIComponent(externalId)}`;
  const res = await fetch(url, { headers });

  if (res.status === 404) {
    throw new NotFoundError('Pokemon card not found');
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Pokemon TCG API error (${res.status}): ${text}`);
  }

  const data = await res.json();
  return normalizePokemonCard(data.data);
}

async function fetchMtgCard(externalId: string): Promise<NormalizedCard> {
  const url = `https://api.scryfall.com/cards/${encodeURIComponent(externalId)}`;
  const res = await fetch(url);

  if (res.status === 404) {
    throw new NotFoundError('MTG card not found');
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Scryfall API error (${res.status}): ${text}`);
  }

  const data = await res.json();
  return normalizeMtgCard(data);
}

async function fetchYugiohCard(externalId: string): Promise<NormalizedCard> {
  const url = `https://db.ygoprodeck.com/api/v7/cardinfo.php?id=${encodeURIComponent(externalId)}`;
  const res = await fetch(url);

  if (!res.ok) {
    if (res.status === 400) {
      throw new NotFoundError('Yu-Gi-Oh card not found');
    }
    const text = await res.text();
    throw new Error(`YGOProDeck API error (${res.status}): ${text}`);
  }

  const data = await res.json();
  if (data.error || !data.data || data.data.length === 0) {
    throw new NotFoundError('Yu-Gi-Oh card not found');
  }

  return normalizeYugiohCard(data.data[0]);
}

class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
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

    const { tcg, externalId } = body as { tcg?: string; externalId?: string };

    // Validate tcg
    if (!tcg || !VALID_TCGS.includes(tcg as TcgType)) {
      return errorResponse(
        `Invalid tcg. Must be one of: ${VALID_TCGS.join(', ')}`,
      );
    }

    // Validate externalId
    if (
      !externalId ||
      typeof externalId !== 'string' ||
      externalId.trim().length === 0
    ) {
      return errorResponse(
        'externalId is required and must be a non-empty string',
      );
    }

    let card: NormalizedCard;

    switch (tcg as TcgType) {
      case 'pokemon':
        card = await fetchPokemonCard(externalId.trim());
        break;
      case 'mtg':
        card = await fetchMtgCard(externalId.trim());
        break;
      case 'yugioh':
        card = await fetchYugiohCard(externalId.trim());
        break;
      default:
        return errorResponse('Unsupported tcg type');
    }

    return jsonResponse({ card });
  } catch (err) {
    if (err instanceof NotFoundError) {
      return errorResponse(err.message, 404);
    }
    console.error('card-details error:', err);
    const message =
      err instanceof Error ? err.message : 'Internal server error';
    return errorResponse(message, 500);
  }
});
