import { os } from '../../../base';
import { OfferRowSchema, OfferItemRowSchema } from '@tcg-trade-hub/database';
import { z } from 'zod';
import { requireAuth } from '../../../middleware/requireAuth';

const InputSchema = z.object({
  listing_id: z.string().uuid(),
});

const OfferWithItemsSchema = OfferRowSchema.extend({
  offer_items: z.array(OfferItemRowSchema),
  offerer: z.object({
    display_name: z.string(),
    avatar_url: z.string().nullable(),
  }),
});

const OutputSchema = z.object({
  offers: z.array(OfferWithItemsSchema),
});

export const list = os
  .input(InputSchema)
  .output(OutputSchema)
  .handler(async ({ input, context }) => {
    const { supabase, userId } = requireAuth(context);

    // Verify listing ownership
    const { data: listing } = await supabase
      .from('listings')
      .select('id')
      .eq('id', input.listing_id)
      .eq('user_id', userId)
      .single();

    if (!listing) {
      throw new Error('Listing not found or not owned by you');
    }

    const { data: offers, error } = await supabase
      .from('offers')
      .select('*, offer_items(*), offerer:users!offerer_id(display_name, avatar_url)')
      .eq('listing_id', input.listing_id)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to list offers: ${error.message}`);
    }

    const mappedOffers = (offers ?? []).map((offer) => ({
      ...offer,
      offer_items: offer.offer_items ?? [],
      offerer: offer.offerer ?? { display_name: 'Unknown', avatar_url: null },
    }));

    return { offers: mappedOffers };
  });
