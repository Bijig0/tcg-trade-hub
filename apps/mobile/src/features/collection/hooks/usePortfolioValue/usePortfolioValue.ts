import { useMemo } from 'react';
import useMyCollection from '../useMyCollection/useMyCollection';
import useMySealedProducts from '../useMySealedProducts/useMySealedProducts';

type PortfolioValue = {
  totalValue: number;
  totalCards: number;
  totalSealedValue: number;
  totalSealedCount: number;
};

/**
 * Computes portfolio value from collection + sealed products.
 * Uses market_price * quantity for cards, purchase_price * quantity for sealed.
 */
const usePortfolioValue = (): PortfolioValue => {
  const { data: collection } = useMyCollection();
  const { data: sealed } = useMySealedProducts();

  return useMemo(() => {
    const cards = collection ?? [];
    const sealedItems = sealed ?? [];

    const totalValue = cards.reduce(
      (sum, item) => sum + (item.market_price ?? 0) * item.quantity,
      0,
    );
    const totalCards = cards.reduce((sum, item) => sum + item.quantity, 0);

    const totalSealedValue = sealedItems.reduce(
      (sum, item) => sum + (item.purchase_price ?? item.market_price ?? 0) * item.quantity,
      0,
    );
    const totalSealedCount = sealedItems.reduce((sum, item) => sum + item.quantity, 0);

    return {
      totalValue: totalValue + totalSealedValue,
      totalCards: totalCards + totalSealedCount,
      totalSealedValue,
      totalSealedCount,
    };
  }, [collection, sealed]);
};

export default usePortfolioValue;
