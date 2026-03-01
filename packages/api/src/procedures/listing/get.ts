import { os } from '../../base';
import {
  ListingRowSchema,
  ListingItemRowSchema,
  OfferRowSchema,
  OfferItemRowSchema,
} from '@tcg-trade-hub/database';
import { z } from 'zod';
import { requireAuth } from '../../middleware/requireAuth';

const InputSchema = z.object({
  id: z.string().uuid(),
});

const OfferWithItemsSchema = OfferRowSchema.extend({
  offer_items: z.array(OfferItemRowSchema),
  offerer: z.object({
    display_name: z.string(),
    avatar_url: z.string().nullable(),
  }),
});

const OutputSchema = z.object({
  listing: ListingRowSchema,
  items: z.array(ListingItemRowSchema),
  offers: z.array(OfferWithItemsSchema),
});

export const get = os
  .input(InputSchema)
  .output(OutputSchema)
  .handler(async ({ input, context }) => {
    const { supabase, userId } = requireAuth(context);

    // Fetch listing with ownership check
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select('*')
      .eq('id', input.id)
      .eq('user_id', userId)
      .single();

    if (listingError || !listing) {
      throw new Error('Listing not found or not owned by you');
    }

    // Fetch listing items
    const { data: items } = await supabase
      .from('listing_items')
      .select('*')
      .eq('listing_id', input.id)
      .order('created_at', { ascending: true });

    // Fetch offers with items and offerer info
    const { data: offers } = await supabase
      .from('offers')
      .select('*, offer_items(*), offerer:users!offerer_id(display_name, avatar_url)')
      .eq('listing_id', input.id)
      .order('created_at', { ascending: false });

    const mappedOffers = (offers ?? []).map((offer) => ({
      ...offer,
      offer_items: offer.offer_items ?? [],
      offerer: offer.offerer ?? { display_name: 'Unknown', avatar_url: null },
    }));

    return {
      listing,
      items: items ?? [],
      offers: mappedOffers,
    };
  });
