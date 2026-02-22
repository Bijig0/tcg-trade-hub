import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { cardDataService } from '@/services/cardData/cardDataService';
import type { PriceHistory } from '@/services/cardData/types';

const PERIOD_DAYS: Record<string, number> = {
  '1M': 30,
  '3M': 90,
  '6M': 180,
  '12M': 365,
  MAX: Infinity,
};

/**
 * Returns price history for a card, filtered by the selected time period.
 */
const usePriceHistory = (externalId: string, period: string) => {
  const { data: detail, isLoading } = useQuery({
    queryKey: ['card-detail', externalId] as const,
    queryFn: () => cardDataService.getCardDetail(externalId),
    staleTime: 1000 * 60 * 30,
    enabled: externalId.length > 0,
  });

  const filtered = useMemo((): PriceHistory | null => {
    const history = detail?.priceHistory;
    if (!history || history.points.length === 0) return null;

    const days = PERIOD_DAYS[period] ?? Infinity;
    if (days === Infinity) return history;

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffStr = cutoff.toISOString().split('T')[0]!;

    const pts = history.points.filter((p) => p.date >= cutoffStr);
    if (pts.length < 2) return history; // fallback to full if too few points

    let high = -Infinity;
    let low = Infinity;
    for (const p of pts) {
      if (p.price > high) high = p.price;
      if (p.price < low) low = p.price;
    }

    const first = pts[0]!.price;
    const last = pts[pts.length - 1]!.price;
    const changePercent =
      first > 0
        ? Math.round(((last - first) / first) * 10000) / 100
        : 0;

    return {
      points: pts,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      changePercent,
    };
  }, [detail, period]);

  return { data: filtered, isLoading };
};

export default usePriceHistory;
