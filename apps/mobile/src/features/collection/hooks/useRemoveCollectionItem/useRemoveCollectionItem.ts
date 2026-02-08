import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { collectionKeys } from '../../queryKeys';

/** Removes a card from the current user's collection */
const useRemoveCollectionItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase
        .from('collection_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: collectionKeys.myCollection() });
    },
  });
};

export default useRemoveCollectionItem;
