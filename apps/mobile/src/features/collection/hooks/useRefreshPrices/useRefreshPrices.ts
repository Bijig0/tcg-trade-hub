import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { cardDataService } from '@/services/cardData';
import { collectionKeys } from '../../queryKeys';
import type { CollectionItemRow } from '@tcg-trade-hub/database';

/**
 * Batch-refreshes market_price for all collection items by
 * fetching current prices from the card data service adapter.
 */
const useRefreshPrices = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (items: CollectionItemRow[]) => {
      const nonSealed = items.filter((item) => !item.is_sealed);
      let updated = 0;

      for (const item of nonSealed) {
        const detail = await cardDataService.getCardDetail(item.external_id);
        if (detail?.marketPrice != null && detail.marketPrice !== item.market_price) {
          const { error } = await supabase
            .from('collection_items')
            .update({ market_price: detail.marketPrice })
            .eq('id', item.id);

          if (!error) updated++;
        }
      }

      return { updated, total: nonSealed.length };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: collectionKeys.all });
    },
  });
};

export default useRefreshPrices;
