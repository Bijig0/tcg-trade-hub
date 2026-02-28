import type { TcgType, NormalizedCard } from '@tcg-trade-hub/database';
import type { CardDataAdapter, CardDetail, SetInfo } from './types';
import {
  getScrydexTcgPath,
  normalizeScrydexCard,
  normalizeScrydexCardDetail,
  type ScrydexCard,
} from './normalizeScrydex/normalizeScrydex';

const BASE_URL = 'https://api.scrydex.com';

type ScrydexListResponse = {
  data: ScrydexCard[];
  total_count?: number;
};

type ScrydexExpansion = {
  id: string;
  name: string;
  code: string;
  release_date: string;
  total_cards: number;
  logo_url?: string;
};

type ScrydexExpansionListResponse = {
  data: ScrydexExpansion[];
};

/**
 * Creates headers with Scrydex API key and team ID.
 */
const buildHeaders = (apiKey: string, teamId: string): Record<string, string> => ({
  'X-Api-Key': apiKey,
  'X-Team-ID': teamId,
  'Content-Type': 'application/json',
});

/**
 * Infers the TCG type from a Scrydex card ID by trying each TCG path.
 * Used when the caller only has an externalId without a TCG context.
 */
const inferTcgFromId = (externalId: string): TcgType => {
  if (externalId.startsWith('op')) return 'onepiece';
  if (externalId.includes('-') && /^[a-f0-9]{8}-/.test(externalId)) return 'mtg';
  return 'pokemon';
};

/**
 * Creates a Scrydex-backed CardDataAdapter.
 *
 * Requires a valid Scrydex API key and team ID.
 * Falls back to the mock adapter if these are not configured.
 */
export const createScrydexAdapter = (
  apiKey: string,
  teamId: string,
): CardDataAdapter => {
  const headers = buildHeaders(apiKey, teamId);

  const searchCards: CardDataAdapter['searchCards'] = async (
    query: string,
    tcg: string,
  ): Promise<NormalizedCard[]> => {
    const tcgPath = getScrydexTcgPath(tcg);
    const url = `${BASE_URL}/${tcgPath}/v1/cards?q=name:${encodeURIComponent(query)}&page_size=20&select=id,name,number,rarity,images,expansion&include=prices`;

    const res = await fetch(url, { headers });

    if (!res.ok) {
      if (res.status === 404) return [];
      throw new Error(`Scrydex search error (${res.status})`);
    }

    const body: ScrydexListResponse = await res.json();
    return (body.data ?? []).map((card) =>
      normalizeScrydexCard(card, tcg as TcgType),
    );
  };

  const getCardDetail: CardDataAdapter['getCardDetail'] = async (
    externalId: string,
  ): Promise<CardDetail | null> => {
    // Try each TCG until we find the card
    const tcgsToTry: TcgType[] = [inferTcgFromId(externalId), 'pokemon', 'mtg', 'onepiece'];
    const tried = new Set<string>();

    for (const tcg of tcgsToTry) {
      if (tried.has(tcg)) continue;
      tried.add(tcg);

      const tcgPath = getScrydexTcgPath(tcg);
      const url = `${BASE_URL}/${tcgPath}/v1/cards/${encodeURIComponent(externalId)}?include=prices`;

      const res = await fetch(url, { headers });

      if (res.ok) {
        const body = await res.json();
        const card: ScrydexCard = body.data ?? body;
        return normalizeScrydexCardDetail(card, tcg);
      }

      if (res.status !== 404) {
        throw new Error(`Scrydex detail error (${res.status})`);
      }
    }

    return null;
  };

  const searchSets: CardDataAdapter['searchSets'] = async (
    query: string,
    tcg: string,
  ): Promise<SetInfo[]> => {
    const tcgPath = getScrydexTcgPath(tcg);
    const url = `${BASE_URL}/${tcgPath}/v1/expansions?q=name:${encodeURIComponent(query)}`;

    const res = await fetch(url, { headers });

    if (!res.ok) {
      if (res.status === 404) return [];
      throw new Error(`Scrydex sets error (${res.status})`);
    }

    const body: ScrydexExpansionListResponse = await res.json();
    return (body.data ?? []).map((exp) => ({
      id: exp.id,
      name: exp.name,
      code: exp.code,
      releaseDate: exp.release_date,
      totalCards: exp.total_cards,
      logoUrl: exp.logo_url ?? null,
    }));
  };

  return { searchCards, getCardDetail, searchSets };
};
