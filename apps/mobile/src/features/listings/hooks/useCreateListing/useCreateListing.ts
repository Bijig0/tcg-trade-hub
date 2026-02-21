import { useMutation, useQueryClient } from '@tanstack/react-query';
import { randomUUID } from 'expo-crypto';
import { supabase } from '@/lib/supabase';
import { listingKeys } from '../../queryKeys';
import { feedKeys } from '../../../feed/queryKeys';
import { collectionKeys } from '../../../collection/queryKeys';
import type { CreateListingForm } from '../../schemas';
import type { ListingRow } from '@tcg-trade-hub/database';

/**
 * Uploads a local photo URI to Supabase Storage and returns the public URL.
 */
const uploadPhoto = async (localUri: string, userId: string, listingId: string, index: number): Promise<string> => {
  const response = await fetch(localUri);
  const blob = await response.blob();

  const fileExtension = localUri.split('.').pop() ?? 'jpg';
  const filePath = `listings/${userId}/${listingId}/${index}.${fileExtension}`;

  const { error: uploadError } = await supabase.storage
    .from('listing-photos')
    .upload(filePath, blob, { contentType: `image/${fileExtension}`, upsert: true });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from('listing-photos').getPublicUrl(filePath);

  return data.publicUrl;
};

/**
 * Hook that creates a new listing.
 *
 * Uploads photos to Supabase Storage first, gets public URLs, then inserts
 * the listing row. Invalidates myListings and feed queries on success.
 */
const useCreateListing = () => {
  const queryClient = useQueryClient();

  return useMutation<ListingRow, Error, CreateListingForm>({
    mutationFn: async (form) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error('User not authenticated');

      // Generate a temporary ID for the storage path
      const tempId = randomUUID();

      // Upload photos in parallel
      const photoUrls = await Promise.all(
        form.photos.map((uri, index) => uploadPhoto(uri, user.id, tempId, index)),
      );

      // Insert the listing
      const { data, error } = await supabase
        .from('listings')
        .insert({
          user_id: user.id,
          type: form.type,
          tcg: form.tcg,
          card_name: form.card_name,
          card_set: form.card_set,
          card_number: form.card_number,
          card_external_id: form.card_external_id,
          card_image_url: form.card_image_url,
          card_rarity: form.card_rarity ?? null,
          card_market_price: form.card_market_price ?? null,
          condition: form.condition,
          asking_price: form.asking_price ?? null,
          description: form.description ?? null,
          photos: photoUrls,
        })
        .select()
        .single();

      if (error) throw error;

      // Auto-add to collection when WTS/WTT uses external search
      if (form.addToCollection && (form.type === 'wts' || form.type === 'wtt')) {
        try {
          await supabase
            .from('collection_items')
            .upsert(
              {
                user_id: user.id,
                tcg: form.tcg,
                external_id: form.card_external_id,
                card_name: form.card_name,
                set_name: form.card_set,
                set_code: '',
                card_number: form.card_number,
                image_url: form.card_image_url,
                rarity: form.card_rarity ?? null,
                condition: form.condition,
                quantity: 1,
                is_wishlist: false,
                is_sealed: false,
                market_price: form.card_market_price ?? null,
              },
              { onConflict: 'user_id,external_id,condition,is_wishlist' },
            );
        } catch {
          // Non-blocking: collection add failure shouldn't prevent listing success
        }
      }

      return data as ListingRow;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: listingKeys.myListings() });
      queryClient.invalidateQueries({ queryKey: feedKeys.lists() });
      queryClient.invalidateQueries({ queryKey: collectionKeys.myCollection() });
      queryClient.invalidateQueries({ queryKey: collectionKeys.portfolioValue() });
    },
  });
};

export default useCreateListing;
