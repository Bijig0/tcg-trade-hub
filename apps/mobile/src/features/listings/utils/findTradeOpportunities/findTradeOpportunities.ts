import type { ListingItemRow, TradeWant } from '@tcg-trade-hub/database';
import type {
  ListingWithItems,
  TradeOpportunity,
  TradeOpportunityOwner,
  TradeOpportunityMatchType,
} from '../../schemas';

type MyListingInput = ListingWithItems & {
  trade_wants: TradeWant[];
};

type OtherListingInput = ListingWithItems & {
  trade_wants: TradeWant[];
  owner: TradeOpportunityOwner;
};

const CONDITION_RANK: Record<string, number> = {
  nm: 5,
  lp: 4,
  mp: 3,
  hp: 2,
  dmg: 1,
};

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Checks if an item satisfies a single trade want.
 * Returns true if the item matches the want criteria.
 */
const itemMatchesWant = (item: ListingItemRow, want: TradeWant): boolean => {
  switch (want.type) {
    case 'specific_card':
      return item.card_external_id === want.card_external_id;

    case 'sealed':
      // Sealed items would have a product_type indicator — checking card_rarity as proxy
      // In practice, listing_items don't have is_sealed; this matches on naming convention
      return false; // Sealed matching requires listing-level metadata not in listing_items

    case 'slab':
      // Graded items would have grading info — not stored in listing_items
      return false; // Slab matching requires collection-level metadata

    case 'raw_cards': {
      if (want.min_condition == null) return true;
      const itemRank = CONDITION_RANK[item.condition] ?? 0;
      const minRank = CONDITION_RANK[want.min_condition] ?? 0;
      return itemRank >= minRank;
    }

    case 'cash':
      return false; // Cash is informational, not item-matchable

    case 'open_to_offers':
      return true; // Matches everything

    case 'custom':
      return false; // Custom tags are not system-matchable
  }
};

/**
 * Finds trade opportunities for a user's listing by comparing against other active listings.
 *
 * Matching logic:
 * - Forward match: other listing's items satisfy my trade_wants → "has what you want"
 * - Reverse match: my listing's items satisfy their trade_wants → "wants what you have"
 * - Mutual: both directions match
 *
 * Scoring:
 * - Forward card match: +5 per matched item
 * - Reverse match: +5 per matched item
 * - Mutual bonus: +3
 * - Same TCG: +2
 * - Recency (7-day decay): +1 max
 */
const findTradeOpportunities = (
  myListing: MyListingInput,
  otherListings: OtherListingInput[],
): TradeOpportunity[] => {
  const opportunities: TradeOpportunity[] = [];

  for (const other of otherListings) {
    // Skip same user
    if (other.user_id === myListing.user_id) continue;

    let forwardScore = 0;
    let reverseScore = 0;
    const matchedCardIds: string[] = [];

    // Forward: do their items match my wants?
    for (const want of myListing.trade_wants) {
      for (const item of other.items) {
        if (itemMatchesWant(item, want)) {
          forwardScore += 5;
          if (!matchedCardIds.includes(item.card_external_id)) {
            matchedCardIds.push(item.card_external_id);
          }
        }
      }
    }

    // Reverse: do my items match their wants?
    for (const want of other.trade_wants) {
      for (const item of myListing.items) {
        if (itemMatchesWant(item, want)) {
          reverseScore += 5;
          if (!matchedCardIds.includes(item.card_external_id)) {
            matchedCardIds.push(item.card_external_id);
          }
        }
      }
    }

    // If no matches at all, skip
    if (forwardScore === 0 && reverseScore === 0) continue;

    // Determine match type
    let matchType: TradeOpportunityMatchType;
    if (forwardScore > 0 && reverseScore > 0) {
      matchType = 'mutual';
    } else if (forwardScore > 0) {
      matchType = 'has_what_you_want';
    } else {
      matchType = 'wants_what_you_have';
    }

    // Calculate total score
    let score = forwardScore + reverseScore;

    // Mutual bonus
    if (matchType === 'mutual') {
      score += 3;
    }

    // Same TCG bonus
    if (other.tcg === myListing.tcg) {
      score += 2;
    }

    // Recency bonus (7-day decay)
    const ageMs = Date.now() - new Date(other.created_at).getTime();
    if (ageMs < SEVEN_DAYS_MS) {
      score += 1 - ageMs / SEVEN_DAYS_MS;
    }

    opportunities.push({
      listing: other,
      owner: other.owner,
      matchType,
      matchedCardIds,
      score,
    });
  }

  // Sort by score descending
  opportunities.sort((a, b) => b.score - a.score);

  return opportunities;
};

export default findTradeOpportunities;
