import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthProvider';
import { collectionKeys } from '../../queryKeys';
import type { AddCollectionItem } from '../../schemas';

/** Adds a card to the current user's collection */
const useAddCollectionItem = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: AddCollectionItem) => {
      const { data, error } = await supabase
        .from('collection_items')
        .upsert(
          {
            user_id: user!.id,
            ...item,
          },
          { onConflict: 'user_id,external_id,condition' },
        )
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: collectionKeys.myCollection() });
    },
  });
};

export default useAddCollectionItem;
