import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { collectionKeys } from '../../queryKeys';
import type { CollectionItemUpdate } from '@tcg-trade-hub/database';

type UpdatePayload = {
  id: string;
  updates: Pick<CollectionItemUpdate, 'condition' | 'quantity' | 'grading_company' | 'grading_score' | 'purchase_price' | 'photos' | 'notes' | 'acquired_at' | 'image_url'>;
};

/** Updates a collection item's fields including condition, grading, photos, notes, and acquisition info */
const useUpdateCollectionItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: UpdatePayload) => {
      const { data, error } = await supabase
        .from('collection_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: collectionKeys.all });
    },
  });
};

export default useUpdateCollectionItem;
