import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthProvider';
import { shopKeys } from '../../queryKeys';

/** Fetches card shops near the current user's location */
const useNearbyShops = () => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: shopKeys.all,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shops')
        .select('*')
        .order('name');

      if (error) throw error;
      return data;
    },
    enabled: !!profile,
  });
};

export default useNearbyShops;
