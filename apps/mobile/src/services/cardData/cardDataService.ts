import type { NormalizedCard } from '@tcg-trade-hub/database';
import type { CardDataAdapter, CardDetail, SetInfo } from './types';
import { createMockAdapter } from './mockAdapter';
import { createScrydexAdapter } from './scrydexAdapter';

/**
 * Card data service that delegates to a pluggable adapter.
 *
 * Uses functional polymorphism: pass any adapter that satisfies
 * CardDataAdapter and the service functions remain identical.
 */
export const createCardDataService = (adapter: CardDataAdapter) => {
  const searchCards = (
    query: string,
    tcg: string,
    setCode?: string,
  ): Promise<NormalizedCard[]> => adapter.searchCards(query, tcg, setCode);

  const getCardDetail = (
    externalId: string,
  ): Promise<CardDetail | null> => adapter.getCardDetail(externalId);

  const searchSets = (
    query: string,
    tcg: string,
  ): Promise<SetInfo[]> => adapter.searchSets(query, tcg);

  return { searchCards, getCardDetail, searchSets };
};

/**
 * Creates the appropriate adapter based on environment configuration.
 * Uses Scrydex when API key + team ID are available, otherwise falls back to mock.
 */
const resolveAdapter = (): CardDataAdapter => {
  const apiKey = process.env.EXPO_PUBLIC_SCRYDEX_API_KEY;
  const teamId = process.env.EXPO_PUBLIC_SCRYDEX_TEAM_ID;

  if (apiKey && teamId) {
    return createScrydexAdapter(apiKey, teamId);
  }

  return createMockAdapter();
};

/**
 * Default singleton — uses Scrydex if configured, otherwise mock.
 */
export const cardDataService = createCardDataService(resolveAdapter());
