import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { shopKeys } from '../../queryKeys';

/** Fetches a single shop's details by ID */
const useShopDetail = (shopId: string | null) => {
  return useQuery({
    queryKey: shopKeys.detail(shopId ?? ''),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shops')
        .select('*')
        .eq('id', shopId!)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!shopId,
  });
};

export default useShopDetail;
