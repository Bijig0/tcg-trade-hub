import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { listingKeys } from '../../queryKeys';
import { TradeWantSchema } from '@tcg-trade-hub/database';
import findTradeOpportunities from '../../utils/findTradeOpportunities/findTradeOpportunities';
import type { ListingRow, ListingItemRow, TradeWant } from '@tcg-trade-hub/database';
import type { TradeOpportunity, TradeOpportunityOwner } from '../../schemas';

/**
 * Parses trade_wants JSONB from a listing row.
 * Returns an empty array if parsing fails.
 */
const parseTradeWants = (raw: unknown): TradeWant[] => {
  try {
    const arr = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (!Array.isArray(arr)) return [];
    return arr.flatMap((item) => {
      const result = TradeWantSchema.safeParse(item);
      return result.success ? [result.data] : [];
    });
  } catch {
    return [];
  }
};

/**
 * Hook that fetches trade opportunities for a specific listing.
 *
 * Queries the user's listing (with trade_wants), then fetches other active listings
 * (same TCG, not own, not blocked) with their items and owner profiles,
 * and runs findTradeOpportunities() to rank them.
 */
const useTradeOpportunities = (listingId: string) => {
  return useQuery<TradeOpportunity[], Error>({
    queryKey: listingKeys.opportunities(listingId),
    queryFn: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user ?? null;

      if (!user) throw new Error('User not authenticated');

      // 1. Fetch the user's listing
      const { data: myListingRow, error: myListingError } = await supabase
        .from('listings')
        .select('*')
        .eq('id', listingId)
        .single();

      if (myListingError) throw myListingError;
      const myListing = myListingRow as ListingRow;

      // 2. Fetch my listing items
      const { data: myItems, error: myItemsError } = await supabase
        .from('listing_items')
        .select('*')
        .eq('listing_id', listingId);

      if (myItemsError) throw myItemsError;

      // 3. Fetch blocked user IDs
      const { data: blocks } = await supabase
        .from('blocks')
        .select('blocked_id, blocker_id')
        .or(`blocker_id.eq.${user.id},blocked_id.eq.${user.id}`);

      const blockedUserIds = new Set(
        (blocks ?? []).flatMap((b) => [b.blocker_id, b.blocked_id].filter((id) => id !== user.id)),
      );

      // 4. Fetch other active listings (same TCG, not own)
      let query = supabase
        .from('listings')
        .select('*')
        .eq('status', 'active')
        .eq('tcg', myListing.tcg)
        .neq('user_id', user.id)
        .limit(50);

      const { data: otherListings, error: otherError } = await query;
      if (otherError) throw otherError;

      const otherListingsFiltered = ((otherListings ?? []) as ListingRow[]).filter(
        (l) => !blockedUserIds.has(l.user_id),
      );

      if (otherListingsFiltered.length === 0) return [];

      // 5. Fetch items for other listings
      const otherIds = otherListingsFiltered.map((l) => l.id);
      const { data: otherItems, error: otherItemsError } = await supabase
        .from('listing_items')
        .select('*')
        .in('listing_id', otherIds);

      if (otherItemsError) throw otherItemsError;

      const itemsByListing = new Map<string, ListingItemRow[]>();
      for (const item of (otherItems ?? []) as ListingItemRow[]) {
        const existing = itemsByListing.get(item.listing_id) ?? [];
        existing.push(item);
        itemsByListing.set(item.listing_id, existing);
      }

      // 6. Fetch owner profiles
      const ownerIds = [...new Set(otherListingsFiltered.map((l) => l.user_id))];
      const { data: owners, error: ownersError } = await supabase
        .from('users')
        .select('id, display_name, avatar_url, rating_score, total_trades')
        .in('id', ownerIds);

      if (ownersError) throw ownersError;

      const ownerMap = new Map<string, TradeOpportunityOwner>();
      for (const o of owners ?? []) {
        ownerMap.set(o.id, o as TradeOpportunityOwner);
      }

      // 7. Build input for algorithm
      const myListingInput = {
        ...myListing,
        items: (myItems ?? []) as ListingItemRow[],
        trade_wants: parseTradeWants(myListing.trade_wants),
      };

      const otherListingInputs = otherListingsFiltered.map((l) => ({
        ...l,
        items: itemsByListing.get(l.id) ?? [],
        trade_wants: parseTradeWants(l.trade_wants),
        owner: ownerMap.get(l.user_id) ?? {
          id: l.user_id,
          display_name: 'Unknown',
          avatar_url: null,
          rating_score: 0,
          total_trades: 0,
        },
      }));

      return findTradeOpportunities(myListingInput, otherListingInputs);
    },
    enabled: !!listingId,
  });
};

export default useTradeOpportunities;
