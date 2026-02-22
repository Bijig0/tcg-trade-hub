import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { listingKeys } from '../../queryKeys';
import type { RelevantListing, RelevantShop } from '../../schemas';

type RelevantListingsResponse = {
  listings: RelevantListing[];
  shops: RelevantShop[];
};

/**
 * Hook that fetches relevant complement listings and nearby shops
 * for an owner's listing via the get-relevant-listings Edge Function.
 */
const useRelevantListings = (listingId: string) => {
  return useQuery<RelevantListingsResponse, Error>({
    queryKey: listingKeys.relevantListings(listingId),
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await supabase.functions.invoke('get-relevant-listings', {
        body: { listing_id: listingId },
      });

      if (response.error) {
        throw new Error(response.error.message ?? 'Failed to fetch relevant listings');
      }

      return response.data as RelevantListingsResponse;
    },
    enabled: !!listingId,
  });
};

export default useRelevantListings;
