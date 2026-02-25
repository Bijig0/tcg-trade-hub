import type { CollectionItemRow, TradeWant } from '@tcg-trade-hub/database';

const CONDITION_RANK: Record<string, number> = {
  nm: 5,
  lp: 4,
  mp: 3,
  hp: 2,
  dmg: 1,
};

/**
 * Finds cards from a user's collection that satisfy the other party's trade wants.
 * Used by MatchConfirmSheet to auto-select cards for a quick match.
 *
 * @param theirTradeWants - What the other person is looking for
 * @param myCollection - Current user's tradeable collection items
 * @returns Collection items that satisfy at least one trade want
 */
const findMatchingCollectionCards = (
  theirTradeWants: TradeWant[],
  myCollection: CollectionItemRow[],
): CollectionItemRow[] => {
  if (theirTradeWants.length === 0 || myCollection.length === 0) return [];

  const matchedIds = new Set<string>();
  const matched: CollectionItemRow[] = [];

  for (const want of theirTradeWants) {
    for (const item of myCollection) {
      if (matchedIds.has(item.id)) continue;

      let isMatch = false;

      switch (want.type) {
        case 'specific_card':
          isMatch = item.external_id === want.card_external_id;
          break;

        case 'sealed':
          if (!item.is_sealed) break;
          if (want.product_type == null) {
            isMatch = true;
          } else {
            isMatch = item.product_type === want.product_type;
          }
          break;

        case 'slab':
          if (item.grading_company == null) break;
          if (want.grading_company != null && item.grading_company !== want.grading_company) break;
          if (want.min_grade != null) {
            const score = parseFloat(item.grading_score ?? '0');
            isMatch = score >= want.min_grade;
          } else {
            isMatch = true;
          }
          break;

        case 'raw_cards':
          if (item.is_sealed || item.grading_company != null) break;
          if (want.min_condition == null) {
            isMatch = true;
          } else {
            const itemRank = CONDITION_RANK[item.condition] ?? 0;
            const minRank = CONDITION_RANK[want.min_condition] ?? 0;
            isMatch = itemRank >= minRank;
          }
          break;

        case 'open_to_offers':
          isMatch = true;
          break;

        case 'cash':
        case 'custom':
          // Not matchable against collection items
          break;
      }

      if (isMatch) {
        matchedIds.add(item.id);
        matched.push(item);
      }
    }
  }

  return matched;
};

export default findMatchingCollectionCards;
