import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/orpc';
import { collectionKeys } from '@/features/collection/queryKeys';
import type { z } from 'zod';
import type { TcgTypeSchema, CollectionItemRowSchema } from '@tcg-trade-hub/database';

type CollectionItem = z.infer<typeof CollectionItemRowSchema>;

type SelectedItem = CollectionItem & {
  asking_price: number | null;
};

type CardSelectorProps = {
  tcg: z.infer<typeof TcgTypeSchema>;
  selectedItems: SelectedItem[];
  onSelectionChange: (items: SelectedItem[]) => void;
};

const CONDITION_LABELS: Record<string, string> = {
  nm: 'NM',
  lp: 'LP',
  mp: 'MP',
  hp: 'HP',
  dmg: 'DMG',
};

export const CardSelector = ({ tcg, selectedItems, onSelectionChange }: CardSelectorProps) => {
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: collectionKeys.list({ tcg, is_tradeable: true, search: search || undefined, limit: 100, offset: 0 }),
    queryFn: () => client.collection.list({ tcg, is_tradeable: true, search: search || undefined, limit: 100, offset: 0 }),
  });

  const items = data?.items ?? [];
  const selectedIds = new Set(selectedItems.map((i) => i.id));

  const toggleItem = (item: CollectionItem) => {
    if (selectedIds.has(item.id)) {
      onSelectionChange(selectedItems.filter((i) => i.id !== item.id));
    } else {
      onSelectionChange([...selectedItems, { ...item, asking_price: item.market_price }]);
    }
  };

  const updateAskingPrice = (id: string, price: number | null) => {
    onSelectionChange(
      selectedItems.map((item) => (item.id === id ? { ...item, asking_price: price } : item)),
    );
  };

  return (
    <div className="space-y-4">
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search your collection..."
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
      />

      {isLoading ? (
        <div className="flex justify-center py-4">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : items.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">
          No tradeable cards found. Add cards to your collection first.
        </p>
      ) : (
        <div className="max-h-64 overflow-y-auto rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 border-b border-border bg-card text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-3 py-2"></th>
                <th className="px-3 py-2">Card</th>
                <th className="px-3 py-2">Set</th>
                <th className="px-3 py-2">Cond</th>
                <th className="px-3 py-2">Qty</th>
                <th className="px-3 py-2">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => toggleItem(item)}
                  className={`cursor-pointer transition-colors ${
                    selectedIds.has(item.id) ? 'bg-primary/5' : 'bg-background hover:bg-accent/50'
                  }`}
                >
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(item.id)}
                      onChange={() => toggleItem(item)}
                      className="rounded border-border"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      {item.image_url && (
                        <img src={item.image_url} alt="" className="h-8 w-6 rounded object-cover" />
                      )}
                      <span className="font-medium text-foreground">{item.card_name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">{item.set_name}</td>
                  <td className="px-3 py-2">{CONDITION_LABELS[item.condition] ?? item.condition}</td>
                  <td className="px-3 py-2">{item.quantity}</td>
                  <td className="px-3 py-2">
                    {item.market_price != null ? `$${Number(item.market_price).toFixed(2)}` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Selected items with asking price inputs */}
      {selectedItems.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground">
            Selected ({selectedItems.length}) — Total: $
            {selectedItems.reduce((sum, i) => sum + (i.asking_price ?? 0) * i.quantity, 0).toFixed(2)}
          </h4>
          <div className="space-y-1.5">
            {selectedItems.map((item) => (
              <div key={item.id} className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2">
                {item.image_url && (
                  <img src={item.image_url} alt="" className="h-8 w-6 rounded object-cover" />
                )}
                <span className="flex-1 text-sm font-medium text-foreground">{item.card_name}</span>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.asking_price ?? ''}
                    onChange={(e) => {
                      const val = e.target.value ? parseFloat(e.target.value) : null;
                      updateAskingPrice(item.id, val);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-20 rounded border border-border bg-background px-2 py-1 text-sm text-foreground"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => toggleItem(item)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  &#10005;
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
