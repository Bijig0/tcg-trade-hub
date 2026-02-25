import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthProvider';
import { collectionKeys } from '../../queryKeys';

/**
 * Fetches a user's sealed products (is_sealed = true).
 * Extracted as a standalone function so both the hook and prefetch use the same queryFn.
 */
export const fetchMySealedProducts = async (userId: string) => {
  const { data, error } = await supabase
    .from('collection_items')
    .select('*')
    .eq('user_id', userId)
    .eq('is_sealed', true)
    .order('tcg')
    .order('card_name');

  if (error) throw error;
  return data;
};

/** Fetches the current user's sealed products (is_sealed = true) */
const useMySealedProducts = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: collectionKeys.mySealedProducts(),
    queryFn: () => fetchMySealedProducts(user!.id),
    enabled: !!user,
  });
};

export default useMySealedProducts;
