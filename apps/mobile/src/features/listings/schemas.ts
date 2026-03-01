import { z } from 'zod';
import {
  ListingTypeSchema,
  CardConditionSchema,
  NormalizedCardSchema,
  OfferStatusSchema,
  TradeWantSchema,
} from '@tcg-trade-hub/database';
import type { ListingRow, ListingItemRow, OfferRow, OfferItemRow, TradeWant } from '@tcg-trade-hub/database';

// --- Bundle listing creation types ---

/**
 * A card selected for bundle listing creation (all types).
 * Tracks origin (collection vs external search) and condition.
 */
export const SelectedCardSchema = z.object({
  card: NormalizedCardSchema,
  condition: CardConditionSchema,
  fromCollection: z.boolean(),
  addToCollection: z.boolean(),
  askingPrice: z.string().default(''),
  notes: z.string().nullable().optional(),
  /** Unique selection key: collection_items.id for collection cards, externalId for external search */
  selectionId: z.string(),
});

export type SelectedCard = z.infer<typeof SelectedCardSchema>;

/**
 * Unified schema for creating a bundle listing.
 * All types (WTS/WTB/WTT) use the same shape: selected cards + cash amount.
 */
export const BundleListingFormSchema = z.object({
  type: ListingTypeSchema,
  selectedCards: z.array(SelectedCardSchema).min(1, 'Select at least one card'),
  cashAmount: z.string().default('0'),
  description: z.string().max(500).nullable().optional(),
  tradeWants: z.array(TradeWantSchema).default([]),
});

export type BundleListingForm = z.infer<typeof BundleListingFormSchema>;

/**
 * Schema for creating an offer on a listing.
 */
export const CreateOfferFormSchema = z.object({
  listingId: z.string().uuid(),
  selectedCards: z.array(SelectedCardSchema),
  cashAmount: z.string().default('0'),
  offeringNote: z.string().max(500).nullable().optional(),
});

export type CreateOfferForm = z.infer<typeof CreateOfferFormSchema>;

// --- My Listings tab types ---

export type MatchedUserInfo = {
  id: string;
  display_name: string;
  avatar_url: string | null;
};

export type MyListingWithOffers = ListingRow & {
  items: ListingItemRow[];
  offer_count: number;
  trade_wants: TradeWant[];
  match_id: string | null;
  matched_user: MatchedUserInfo | null;
  conversation_id: string | null;
};

// --- Trade opportunity types ---

export type ListingWithItems = ListingRow & {
  items: ListingItemRow[];
};

export type TradeOpportunityOwner = {
  id: string;
  display_name: string;
  avatar_url: string | null;
  rating_score: number;
  total_trades: number;
};

export type TradeOpportunityMatchType = 'has_what_you_want' | 'wants_what_you_have' | 'mutual';

export type TradeOpportunity = {
  listing: ListingWithItems;
  owner: TradeOpportunityOwner;
  matchType: TradeOpportunityMatchType;
  matchedCardIds: string[];
  score: number;
};

export const LISTING_TABS = ['active', 'matched', 'history'] as const;
export type ListingTab = (typeof LISTING_TABS)[number];

// --- Offer types ---

export type OfferWithItems = OfferRow & {
  items: OfferItemRow[];
  offerer: {
    id: string;
    display_name: string;
    avatar_url: string | null;
    rating_score: number;
    total_trades: number;
  };
};

// --- Relevant shops (used on detail map) ---

export type RelevantShop = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  supported_tcgs: string[];
  verified: boolean;
};

export { OfferStatusSchema };
