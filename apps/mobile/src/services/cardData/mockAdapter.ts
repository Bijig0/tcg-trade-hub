import type { CardDataAdapter } from './types';
import { getMockCards, getMockCardDetail, getMockSets } from './mockData';

/**
 * Mock adapter that returns hardcoded card data.
 * Simulates async behavior with a small delay.
 *
 * Replace with a real adapter (e.g. createScrydexAdapter) when ready.
 */
export const createMockAdapter = (): CardDataAdapter => {
  const searchCards: CardDataAdapter['searchCards'] = async (query, tcg, setCode) => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 200));
    return getMockCards(query, tcg, setCode);
  };

  const getCardDetail: CardDataAdapter['getCardDetail'] = async (externalId) => {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return getMockCardDetail(externalId);
  };

  const searchSets: CardDataAdapter['searchSets'] = async (query, tcg) => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return getMockSets(query, tcg);
  };

  return { searchCards, getCardDetail, searchSets };
};
