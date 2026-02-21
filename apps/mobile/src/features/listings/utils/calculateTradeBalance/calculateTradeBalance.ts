import type { SelectedCard, WantedCard } from '../../schemas';

type Fairness = 'fair' | 'slight_imbalance' | 'imbalanced';

type TradeBalance = {
  offerTotal: number;
  wantTotal: number;
  differencePercent: number;
  fairness: Fairness;
};

/**
 * Calculates the trade balance between offered and wanted cards.
 *
 * Uses market prices to determine fairness:
 * - < 15% difference: fair
 * - 15–30% difference: slight_imbalance
 * - > 30% difference: imbalanced
 *
 * Cards without market prices are treated as $0.
 */
const calculateTradeBalance = (
  selectedCards: SelectedCard[],
  wantedCards: WantedCard[],
): TradeBalance => {
  const offerTotal = selectedCards.reduce(
    (sum, sc) => sum + (sc.card.marketPrice ?? 0),
    0,
  );

  const wantTotal = wantedCards.reduce(
    (sum, wc) => sum + (wc.card.marketPrice ?? 0),
    0,
  );

  const maxTotal = Math.max(offerTotal, wantTotal);
  const differencePercent =
    maxTotal === 0 ? 0 : (Math.abs(offerTotal - wantTotal) / maxTotal) * 100;

  let fairness: Fairness;
  if (differencePercent < 15) {
    fairness = 'fair';
  } else if (differencePercent <= 30) {
    fairness = 'slight_imbalance';
  } else {
    fairness = 'imbalanced';
  }

  return { offerTotal, wantTotal, differencePercent, fairness };
};

export default calculateTradeBalance;
export type { TradeBalance, Fairness };
