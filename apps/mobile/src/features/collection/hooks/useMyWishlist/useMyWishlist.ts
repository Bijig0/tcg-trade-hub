import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthProvider';
import { collectionKeys } from '../../queryKeys';

/** Fetches the current user's wishlist items (is_wishlist = true) */
const useMyWishlist = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: collectionKeys.myWishlist(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('collection_items')
        .select('*')
        .eq('user_id', user!.id)
        .eq('is_wishlist', true)
        .order('tcg')
        .order('card_name');

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export default useMyWishlist;
