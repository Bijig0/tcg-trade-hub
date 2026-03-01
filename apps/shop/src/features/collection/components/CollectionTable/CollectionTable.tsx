import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from '@/lib/orpc';
import { collectionKeys } from '../../queryKeys';
import { CollectionFilters } from '../CollectionFilters/CollectionFilters';
import { EditCardModal } from '../EditCardModal/EditCardModal';
import type { z } from 'zod';
import type { TcgTypeSchema, CardConditionSchema, CollectionItemRowSchema } from '@tcg-trade-hub/database';

type CollectionItem = z.infer<typeof CollectionItemRowSchema>;

const CONDITION_LABELS: Record<string, string> = {
  nm: 'NM',
  lp: 'LP',
  mp: 'MP',
  hp: 'HP',
  dmg: 'DMG',
};

const PAGE_SIZE = 50;

export const CollectionTable = () => {
  const queryClient = useQueryClient();
  const [tcg, setTcg] = useState<z.infer<typeof TcgTypeSchema>>();
  const [condition, setCondition] = useState<z.infer<typeof CardConditionSchema>>();
  const [isTradeable, setIsTradeable] = useState<boolean>();
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editItem, setEditItem] = useState<CollectionItem | null>(null);

  const filters = { tcg, condition, is_tradeable: isTradeable, search: search || undefined, limit: PAGE_SIZE, offset };

  const { data, isLoading } = useQuery({
    queryKey: collectionKeys.list(filters),
    queryFn: () => client.collection.list(filters),
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => client.collection.remove({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: collectionKeys.all });
      setSelected(new Set());
    },
  });

  const updateMutation = useMutation({
    mutationFn: (params: { id: string; is_tradeable: boolean }) =>
      client.collection.update(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: collectionKeys.all });
      setSelected(new Set());
    },
  });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const allSelected = items.length > 0 && items.every((i) => selected.has(i.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(items.map((i) => i.id)));
    }
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkDelete = () => {
    for (const id of selected) {
      removeMutation.mutate(id);
    }
  };

  const handleBulkToggleTradeable = (value: boolean) => {
    for (const id of selected) {
      updateMutation.mutate({ id, is_tradeable: value });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <CollectionFilters
        tcg={tcg}
        condition={condition}
        isTradeable={isTradeable}
        search={search}
        onTcgChange={(v) => { setTcg(v); setOffset(0); }}
        onConditionChange={(v) => { setCondition(v); setOffset(0); }}
        onTradeableChange={(v) => { setIsTradeable(v); setOffset(0); }}
        onSearchChange={(v) => { setSearch(v); setOffset(0); }}
      />

      {selected.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-2">
          <span className="text-sm text-muted-foreground">{selected.size} selected</span>
          <button
            type="button"
            onClick={() => handleBulkToggleTradeable(true)}
            className="rounded-lg bg-success/10 px-3 py-1 text-xs font-medium text-success"
          >
            Mark Tradeable
          </button>
          <button
            type="button"
            onClick={() => handleBulkToggleTradeable(false)}
            className="rounded-lg bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
          >
            Mark Not Tradeable
          </button>
          <button
            type="button"
            onClick={handleBulkDelete}
            className="rounded-lg bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive"
          >
            Delete
          </button>
        </div>
      )}

      {items.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">No collection items found. Add cards to get started!</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-card text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-3 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    className="rounded border-border"
                  />
                </th>
                <th className="px-3 py-3">Card</th>
                <th className="px-3 py-3">Set</th>
                <th className="px-3 py-3">#</th>
                <th className="px-3 py-3">Condition</th>
                <th className="px-3 py-3">Qty</th>
                <th className="px-3 py-3">Price</th>
                <th className="px-3 py-3">Tradeable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => setEditItem(item)}
                  className="cursor-pointer bg-background transition-colors hover:bg-accent/50"
                >
                  <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selected.has(item.id)}
                      onChange={() => toggleSelect(item.id)}
                      className="rounded border-border"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      {item.image_url && (
                        <img
                          src={item.image_url}
                          alt={item.card_name}
                          className="h-11 w-8 rounded object-cover"
                        />
                      )}
                      <span className="font-medium text-foreground">{item.card_name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">{item.set_name}</td>
                  <td className="px-3 py-2 text-muted-foreground">{item.card_number}</td>
                  <td className="px-3 py-2">
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium">
                      {CONDITION_LABELS[item.condition] ?? item.condition}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-foreground">{item.quantity}</td>
                  <td className="px-3 py-2 text-foreground">
                    {item.market_price != null ? `$${Number(item.market_price).toFixed(2)}` : '—'}
                  </td>
                  <td className="px-3 py-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      item.is_tradeable
                        ? 'bg-success/10 text-success'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {item.is_tradeable ? 'Yes' : 'No'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {total > PAGE_SIZE && (
        <div className="flex items-center justify-between px-1">
          <span className="text-sm text-muted-foreground">
            {offset + 1}–{Math.min(offset + PAGE_SIZE, total)} of {total}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={offset === 0}
              onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
              className="rounded-lg border border-border px-3 py-1 text-sm text-foreground disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={offset + PAGE_SIZE >= total}
              onClick={() => setOffset(offset + PAGE_SIZE)}
              className="rounded-lg border border-border px-3 py-1 text-sm text-foreground disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {editItem && (
        <EditCardModal
          item={editItem}
          onClose={() => setEditItem(null)}
        />
      )}
    </div>
  );
};
