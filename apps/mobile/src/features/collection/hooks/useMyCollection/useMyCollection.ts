import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthProvider';
import { collectionKeys } from '../../queryKeys';

/** Fetches the current user's card collection grouped by TCG */
const useMyCollection = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: collectionKeys.myCollection(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('collection_items')
        .select('*')
        .eq('user_id', user!.id)
        .order('tcg')
        .order('card_name');

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export default useMyCollection;
