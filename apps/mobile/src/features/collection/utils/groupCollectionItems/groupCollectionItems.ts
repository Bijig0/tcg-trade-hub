import type { CollectionItemRow, TcgType } from '@tcg-trade-hub/database';

export type CollectionCardGroup = {
  groupKey: string;
  card_name: string;
  set_name: string;
  set_code: string;
  card_number: string;
  tcg: TcgType;
  image_url: string;
  rarity: string | null;
  totalCount: number;
  totalValue: number;
  items: CollectionItemRow[];
};

/**
 * Groups collection items by external_id for display.
 * Each group aggregates count and value across individual physical cards.
 * Items within each group are sorted by condition (nm first).
 */
const groupCollectionItems = (items: CollectionItemRow[]): CollectionCardGroup[] => {
  const conditionOrder: Record<string, number> = { nm: 0, lp: 1, mp: 2, hp: 3, dmg: 4 };

  const groupMap = new Map<string, CollectionCardGroup>();

  for (const item of items) {
    const existing = groupMap.get(item.external_id);
    if (existing) {
      existing.totalCount += item.quantity;
      existing.totalValue += (item.market_price ?? 0) * item.quantity;
      existing.items.push(item);
    } else {
      groupMap.set(item.external_id, {
        groupKey: item.external_id,
        card_name: item.card_name,
        set_name: item.set_name,
        set_code: item.set_code,
        card_number: item.card_number,
        tcg: item.tcg,
        image_url: item.image_url,
        rarity: item.rarity,
        totalCount: item.quantity,
        totalValue: (item.market_price ?? 0) * item.quantity,
        items: [item],
      });
    }
  }

  const groups = Array.from(groupMap.values());

  for (const group of groups) {
    group.items.sort(
      (a, b) => (conditionOrder[a.condition] ?? 99) - (conditionOrder[b.condition] ?? 99),
    );
  }

  return groups;
};

export default groupCollectionItems;
