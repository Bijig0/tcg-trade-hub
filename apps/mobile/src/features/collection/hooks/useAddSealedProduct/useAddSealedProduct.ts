import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthProvider';
import { collectionKeys } from '../../queryKeys';
import type { AddCollectionItem } from '../../schemas';

/** Adds a sealed product to the current user's collection */
const useAddSealedProduct = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: Omit<AddCollectionItem, 'is_sealed'>) => {
      const { data, error } = await supabase
        .from('collection_items')
        .upsert(
          {
            user_id: user!.id,
            ...item,
            is_sealed: true,
          },
          { onConflict: 'user_id,external_id,condition,is_wishlist' },
        )
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: collectionKeys.mySealedProducts() });
      queryClient.invalidateQueries({ queryKey: collectionKeys.myCollection() });
      queryClient.invalidateQueries({ queryKey: collectionKeys.portfolioValue() });
    },
  });
};

export default useAddSealedProduct;
