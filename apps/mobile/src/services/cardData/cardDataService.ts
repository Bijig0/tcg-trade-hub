import type { NormalizedCard } from '@tcg-trade-hub/database';
import type { CardDataAdapter, CardDetail, SetInfo } from './types';
import { createMockAdapter } from './mockAdapter';

/**
 * Card data service that delegates to a pluggable adapter.
 *
 * Uses functional polymorphism: pass any adapter that satisfies
 * CardDataAdapter and the service functions remain identical.
 *
 * To swap data sources later:
 * ```ts
 * import { createScrydexAdapter } from './scrydexAdapter';
 * const service = createCardDataService(createScrydexAdapter());
 * ```
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
 * Default singleton using mock adapter.
 * Swap createMockAdapter() for a real adapter when API is available.
 */
export const cardDataService = createCardDataService(createMockAdapter());
