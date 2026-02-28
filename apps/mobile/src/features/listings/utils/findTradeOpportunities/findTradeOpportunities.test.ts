import { describe, it, expect } from 'vitest';
import findTradeOpportunities from './findTradeOpportunities';
import type { ListingItemRow, TradeWant } from '@tcg-trade-hub/database';
import type { TradeOpportunityOwner } from '../../schemas';

const makeItem = (overrides: Partial<ListingItemRow> = {}): ListingItemRow => ({
  id: 'item-1',
  listing_id: 'listing-1',
  collection_item_id: null,
  card_name: 'Charizard VMAX',
  card_image_url: 'https://example.com/charizard.png',
  card_external_id: 'sv4-6',
  tcg: 'pokemon',
  card_set: 'Obsidian Flames',
  card_number: '6',
  card_rarity: 'Ultra Rare',
  condition: 'nm',
  market_price: 25.0,
  asking_price: 20.0,
  quantity: 1,
  created_at: new Date().toISOString(),
  ...overrides,
});

const makeOwner = (overrides: Partial<TradeOpportunityOwner> = {}): TradeOpportunityOwner => ({
  id: 'user-other',
  display_name: 'TestUser',
  avatar_url: null,
  rating_score: 4.5,
  total_trades: 10,
  ...overrides,
});

describe('findTradeOpportunities', () => {
  it('should return empty array when no listings match', () => {
    const myListing = {
      id: 'my-listing',
      user_id: 'user-me',
      type: 'wtt' as const,
      tcg: 'pokemon' as const,
      title: 'My cards',
      cash_amount: 0,
      total_value: 25,
      description: null,
      photos: [],
      trade_wants: [] as TradeWant[],
      accepts_cash: false,
      accepts_trades: true,
      status: 'active' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      items: [makeItem()],
    };

    const result = findTradeOpportunities(myListing, []);
    expect(result).toEqual([]);
  });

  it('should find forward match when other listing has what I want', () => {
    const myListing = {
      id: 'my-listing',
      user_id: 'user-me',
      type: 'wtt' as const,
      tcg: 'pokemon' as const,
      title: 'My cards',
      cash_amount: 0,
      total_value: 25,
      description: null,
      photos: [],
      trade_wants: [{ type: 'specific_card' as const, card_external_id: 'sv4-100', card_name: 'Pikachu', card_image_url: null, tcg: 'pokemon' as const }] as TradeWant[],
      accepts_cash: false,
      accepts_trades: true,
      status: 'active' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      items: [makeItem()],
    };

    const otherListing = {
      id: 'other-listing',
      user_id: 'user-other',
      type: 'wtt' as const,
      tcg: 'pokemon' as const,
      title: 'Other cards',
      cash_amount: 0,
      total_value: 10,
      description: null,
      photos: [],
      trade_wants: [] as TradeWant[],
      accepts_cash: false,
      accepts_trades: true,
      status: 'active' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      items: [makeItem({ id: 'item-2', card_external_id: 'sv4-100', card_name: 'Pikachu' })],
      owner: makeOwner(),
    };

    const result = findTradeOpportunities(myListing, [otherListing]);
    expect(result).toHaveLength(1);
    expect(result[0].matchType).toBe('has_what_you_want');
    expect(result[0].matchedCardIds).toContain('sv4-100');
  });

  it('should find reverse match when other user wants what I have', () => {
    const myListing = {
      id: 'my-listing',
      user_id: 'user-me',
      type: 'wtt' as const,
      tcg: 'pokemon' as const,
      title: 'My cards',
      cash_amount: 0,
      total_value: 25,
      description: null,
      photos: [],
      trade_wants: [] as TradeWant[],
      accepts_cash: false,
      accepts_trades: true,
      status: 'active' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      items: [makeItem({ card_external_id: 'sv4-6' })],
    };

    const otherListing = {
      id: 'other-listing',
      user_id: 'user-other',
      type: 'wtt' as const,
      tcg: 'pokemon' as const,
      title: 'Other cards',
      cash_amount: 0,
      total_value: 10,
      description: null,
      photos: [],
      trade_wants: [{ type: 'specific_card' as const, card_external_id: 'sv4-6', card_name: 'Charizard VMAX', card_image_url: null, tcg: 'pokemon' as const }] as TradeWant[],
      accepts_cash: false,
      accepts_trades: true,
      status: 'active' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      items: [makeItem({ id: 'item-2', card_external_id: 'sv4-200', card_name: 'Mewtwo' })],
      owner: makeOwner(),
    };

    const result = findTradeOpportunities(myListing, [otherListing]);
    expect(result).toHaveLength(1);
    expect(result[0].matchType).toBe('wants_what_you_have');
  });

  it('should detect mutual match and apply bonus', () => {
    const myListing = {
      id: 'my-listing',
      user_id: 'user-me',
      type: 'wtt' as const,
      tcg: 'pokemon' as const,
      title: 'My cards',
      cash_amount: 0,
      total_value: 25,
      description: null,
      photos: [],
      trade_wants: [{ type: 'specific_card' as const, card_external_id: 'sv4-200', card_name: 'Mewtwo', card_image_url: null, tcg: 'pokemon' as const }] as TradeWant[],
      accepts_cash: false,
      accepts_trades: true,
      status: 'active' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      items: [makeItem({ card_external_id: 'sv4-6' })],
    };

    const otherListing = {
      id: 'other-listing',
      user_id: 'user-other',
      type: 'wtt' as const,
      tcg: 'pokemon' as const,
      title: 'Other cards',
      cash_amount: 0,
      total_value: 10,
      description: null,
      photos: [],
      trade_wants: [{ type: 'specific_card' as const, card_external_id: 'sv4-6', card_name: 'Charizard VMAX', card_image_url: null, tcg: 'pokemon' as const }] as TradeWant[],
      accepts_cash: false,
      accepts_trades: true,
      status: 'active' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      items: [makeItem({ id: 'item-2', card_external_id: 'sv4-200', card_name: 'Mewtwo' })],
      owner: makeOwner(),
    };

    const result = findTradeOpportunities(myListing, [otherListing]);
    expect(result).toHaveLength(1);
    expect(result[0].matchType).toBe('mutual');
    expect(result[0].score).toBeGreaterThan(10); // 5+5+3+2 + recency
  });

  it('should match raw_cards want with condition filtering', () => {
    const myListing = {
      id: 'my-listing',
      user_id: 'user-me',
      type: 'wtt' as const,
      tcg: 'pokemon' as const,
      title: 'My cards',
      cash_amount: 0,
      total_value: 25,
      description: null,
      photos: [],
      trade_wants: [{ type: 'raw_cards' as const, min_condition: 'lp' as const }] as TradeWant[],
      accepts_cash: false,
      accepts_trades: true,
      status: 'active' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      items: [makeItem()],
    };

    const nmListing = {
      id: 'other-nm',
      user_id: 'user-other-1',
      type: 'wtt' as const,
      tcg: 'pokemon' as const,
      title: 'NM cards',
      cash_amount: 0,
      total_value: 10,
      description: null,
      photos: [],
      trade_wants: [] as TradeWant[],
      accepts_cash: false,
      accepts_trades: true,
      status: 'active' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      items: [makeItem({ id: 'item-nm', card_external_id: 'card-nm', condition: 'nm' })],
      owner: makeOwner({ id: 'user-other-1' }),
    };

    const hpListing = {
      id: 'other-hp',
      user_id: 'user-other-2',
      type: 'wtt' as const,
      tcg: 'pokemon' as const,
      title: 'HP cards',
      cash_amount: 0,
      total_value: 5,
      description: null,
      photos: [],
      trade_wants: [] as TradeWant[],
      accepts_cash: false,
      accepts_trades: true,
      status: 'active' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      items: [makeItem({ id: 'item-hp', card_external_id: 'card-hp', condition: 'hp' })],
      owner: makeOwner({ id: 'user-other-2' }),
    };

    const result = findTradeOpportunities(myListing, [nmListing, hpListing]);
    // NM matches (rank 5 >= LP rank 4), HP doesn't (rank 2 < LP rank 4)
    expect(result).toHaveLength(1);
    expect(result[0].listing.id).toBe('other-nm');
  });

  it('should sort results by score descending', () => {
    const myListing = {
      id: 'my-listing',
      user_id: 'user-me',
      type: 'wtt' as const,
      tcg: 'pokemon' as const,
      title: 'My cards',
      cash_amount: 0,
      total_value: 25,
      description: null,
      photos: [],
      trade_wants: [
        { type: 'specific_card' as const, card_external_id: 'card-a', card_name: 'Card A', card_image_url: null, tcg: 'pokemon' as const },
      ] as TradeWant[],
      accepts_cash: false,
      accepts_trades: true,
      status: 'active' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      items: [makeItem({ card_external_id: 'my-card' })],
    };

    const singleMatch = {
      id: 'single-match',
      user_id: 'user-1',
      type: 'wtt' as const,
      tcg: 'pokemon' as const,
      title: 'Single',
      cash_amount: 0,
      total_value: 10,
      description: null,
      photos: [],
      trade_wants: [] as TradeWant[],
      accepts_cash: false,
      accepts_trades: true,
      status: 'active' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      items: [makeItem({ id: 'i1', card_external_id: 'card-a' })],
      owner: makeOwner({ id: 'user-1' }),
    };

    const doubleMatch = {
      id: 'double-match',
      user_id: 'user-2',
      type: 'wtt' as const,
      tcg: 'pokemon' as const,
      title: 'Double',
      cash_amount: 0,
      total_value: 20,
      description: null,
      photos: [],
      trade_wants: [
        { type: 'specific_card' as const, card_external_id: 'my-card', card_name: 'My Card', card_image_url: null, tcg: 'pokemon' as const },
      ] as TradeWant[],
      accepts_cash: false,
      accepts_trades: true,
      status: 'active' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      items: [makeItem({ id: 'i2', card_external_id: 'card-a' })],
      owner: makeOwner({ id: 'user-2' }),
    };

    const result = findTradeOpportunities(myListing, [singleMatch, doubleMatch]);
    expect(result).toHaveLength(2);
    // Double match is mutual (5+5+3+2) > single match (5+2)
    expect(result[0].listing.id).toBe('double-match');
    expect(result[0].matchType).toBe('mutual');
    expect(result[1].listing.id).toBe('single-match');
  });

  it('should skip listings from the same user', () => {
    const myListing = {
      id: 'my-listing',
      user_id: 'user-me',
      type: 'wtt' as const,
      tcg: 'pokemon' as const,
      title: 'My cards',
      cash_amount: 0,
      total_value: 25,
      description: null,
      photos: [],
      trade_wants: [{ type: 'open_to_offers' as const }] as TradeWant[],
      accepts_cash: false,
      accepts_trades: true,
      status: 'active' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      items: [makeItem()],
    };

    const ownListing = {
      id: 'own-other',
      user_id: 'user-me',
      type: 'wtt' as const,
      tcg: 'pokemon' as const,
      title: 'Also mine',
      cash_amount: 0,
      total_value: 10,
      description: null,
      photos: [],
      trade_wants: [] as TradeWant[],
      accepts_cash: false,
      accepts_trades: true,
      status: 'active' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      items: [makeItem({ id: 'item-own', card_external_id: 'card-own' })],
      owner: makeOwner({ id: 'user-me' }),
    };

    const result = findTradeOpportunities(myListing, [ownListing]);
    expect(result).toEqual([]);
  });
});
