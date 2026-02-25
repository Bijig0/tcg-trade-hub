import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { listingKeys } from '../../queryKeys';
import type { OfferRow } from '@tcg-trade-hub/database';

/**
 * Subscribes to Supabase Realtime for offer changes on a specific listing.
 * - UPDATE on offers: invalidates the offers list, and on acceptance also
 *   invalidates the listing detail and myListings queries.
 * - INSERT on offers: new offer arrived, invalidates offers list.
 */
const useRealtimeOfferUpdates = (listingId: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!listingId) return;

    const channel = supabase
      .channel(`offers:listing:${listingId}`)
      .on<OfferRow>(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'offers',
          filter: `listing_id=eq.${listingId}`,
        },
        (payload) => {
          queryClient.invalidateQueries({
            queryKey: listingKeys.offers(listingId),
          });

          // If an offer was accepted, the listing status also changed
          if (payload.new.status === 'accepted') {
            queryClient.invalidateQueries({
              queryKey: listingKeys.detail(listingId),
            });
            queryClient.invalidateQueries({
              queryKey: listingKeys.myListings(),
            });
          }
        },
      )
      .on<OfferRow>(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'offers',
          filter: `listing_id=eq.${listingId}`,
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: listingKeys.offers(listingId),
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [listingId, queryClient]);
};

export default useRealtimeOfferUpdates;
