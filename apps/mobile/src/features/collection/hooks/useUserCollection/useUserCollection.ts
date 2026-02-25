import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { collectionKeys } from '../../queryKeys';

/** Fetches another user's tradeable card collection (excludes wishlist and hidden items) */
const useUserCollection = (userId: string | null) => {
  return useQuery({
    queryKey: collectionKeys.userCollection(userId ?? ''),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('collection_items')
        .select('*')
        .eq('user_id', userId!)
        .eq('is_tradeable', true)
        .eq('is_wishlist', false)
        .order('tcg')
        .order('card_name');

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
};

export default useUserCollection;
