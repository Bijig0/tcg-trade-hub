import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthProvider';
import { collectionKeys } from '../../queryKeys';

type ToggleItemInput = {
  itemId: string;
  is_tradeable: boolean;
};

type SetAllInput = {
  is_tradeable: boolean;
};

/**
 * Hook that provides mutations for updating collection item visibility.
 *
 * - `toggleItem`: Updates a single item's `is_tradeable` status
 * - `setAll`: Bulk updates all of the user's collection items
 */
const useUpdateCollectionVisibility = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const toggleItem = useMutation<void, Error, ToggleItemInput>({
    mutationFn: async ({ itemId, is_tradeable }) => {
      const { error } = await supabase
        .from('collection_items')
        .update({ is_tradeable })
        .eq('id', itemId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: collectionKeys.myCollection() });
    },
  });

  const setAll = useMutation<void, Error, SetAllInput>({
    mutationFn: async ({ is_tradeable }) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('collection_items')
        .update({ is_tradeable })
        .eq('user_id', user.id)
        .eq('is_wishlist', false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: collectionKeys.myCollection() });
    },
  });

  return { toggleItem, setAll };
};

export default useUpdateCollectionVisibility;
