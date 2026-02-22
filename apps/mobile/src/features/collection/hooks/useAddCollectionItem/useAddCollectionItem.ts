import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthProvider';
import { collectionKeys } from '../../queryKeys';
import type { AddCollectionItem } from '../../schemas';

/** Adds a card to the current user's collection as a unique item (each physical card = 1 row) */
const useAddCollectionItem = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: AddCollectionItem) => {
      const { data, error } = await supabase
        .from('collection_items')
        .insert({
          user_id: user!.id,
          ...item,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: collectionKeys.myCollection() });
      queryClient.invalidateQueries({ queryKey: collectionKeys.portfolioValue() });
    },
  });
};

export default useAddCollectionItem;
