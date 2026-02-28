import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { feedKeys } from '../../queryKeys';
import transformRawListing from '../../algorithm/transformRawListing/transformRawListing';
import type { RawFeedListing } from '../../algorithm/transformRawListing/transformRawListing';
import type { ListingWithDistance } from '../../schemas';

type CardListingsResult = {
  singles: ListingWithDistance[];
  bundles: ListingWithDistance[];
};

/**
 * Queries all active listings containing a specific card by `card_external_id`.
 *
 * Splits results into:
 * - singles: listings with exactly 1 item (the matched card)
 * - bundles: listings with >1 items that include the matched card
 */
const useCardListings = (externalId: string) => {
  return useQuery<CardListingsResult, Error>({
    queryKey: feedKeys.cardListings(externalId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('listing_items')
        .select(`
          *,
          listing:listings!inner (
            *,
            listing_items (*),
            users!inner (
              id,
              display_name,
              avatar_url,
              location,
              rating_score,
              total_trades
            )
          )
        `)
        .eq('card_external_id', externalId)
        .eq('listing.status', 'active');

      if (error) {
        console.error('[useCardListings] Supabase query error:', error);
        throw error;
      }

      const all = (data ?? []).map((row) =>
        transformRawListing(row.listing as unknown as RawFeedListing),
      );

      // Deduplicate by listing id (a bundle may have multiple matching items)
      const seen = new Set<string>();
      const unique = all.filter((listing) => {
        if (seen.has(listing.id)) return false;
        seen.add(listing.id);
        return true;
      });

      return {
        singles: unique.filter((l) => l.items.length === 1),
        bundles: unique.filter((l) => l.items.length > 1),
      };
    },
    enabled: externalId.length > 0,
  });
};

export default useCardListings;
