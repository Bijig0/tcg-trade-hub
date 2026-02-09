import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthProvider';
import { collectionKeys } from '../../queryKeys';
import type { AddCollectionItem } from '../../schemas';

/** Adds a card to the current user's wishlist */
const useAddWishlistItem = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: Omit<AddCollectionItem, 'is_wishlist'>) => {
      const { data, error } = await supabase
        .from('collection_items')
        .upsert(
          {
            user_id: user!.id,
            ...item,
            is_wishlist: true,
          },
          { onConflict: 'user_id,external_id,condition,is_wishlist' },
        )
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: collectionKeys.myWishlist() });
    },
  });
};

export default useAddWishlistItem;
