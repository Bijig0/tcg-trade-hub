import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthProvider';
import { collectionKeys } from '../../queryKeys';

/**
 * Fetches a user's card collection (not wishlist, not sealed).
 * Extracted as a standalone function so both the hook and prefetch use the same queryFn.
 */
export const fetchMyCollection = async (userId: string) => {
  const { data, error } = await supabase
    .from('collection_items')
    .select('*')
    .eq('user_id', userId)
    .eq('is_wishlist', false)
    .eq('is_sealed', false)
    .order('tcg')
    .order('card_name');

  if (error) throw error;
  return data;
};

/** Fetches the current user's card collection (not wishlist, not sealed) */
const useMyCollection = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: collectionKeys.myCollection(),
    queryFn: () => fetchMyCollection(user!.id),
    enabled: !!user,
  });
};

export default useMyCollection;
