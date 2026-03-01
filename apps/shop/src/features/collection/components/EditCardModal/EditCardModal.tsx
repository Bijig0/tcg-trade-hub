import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from '@/lib/orpc';
import { collectionKeys } from '../../queryKeys';
import type { z } from 'zod';
import type { CollectionItemRowSchema, CardConditionSchema } from '@tcg-trade-hub/database';

type CollectionItem = z.infer<typeof CollectionItemRowSchema>;

type EditCardModalProps = {
  item: CollectionItem;
  onClose: () => void;
};

const CONDITION_OPTIONS: { value: z.infer<typeof CardConditionSchema>; label: string }[] = [
  { value: 'nm', label: 'Near Mint' },
  { value: 'lp', label: 'Lightly Played' },
  { value: 'mp', label: 'Moderately Played' },
  { value: 'hp', label: 'Heavily Played' },
  { value: 'dmg', label: 'Damaged' },
];

export const EditCardModal = ({ item, onClose }: EditCardModalProps) => {
  const queryClient = useQueryClient();
  const [condition, setCondition] = useState(item.condition);
  const [quantity, setQuantity] = useState(item.quantity);
  const [notes, setNotes] = useState(item.notes ?? '');
  const [isTradeable, setIsTradeable] = useState(item.is_tradeable);

  const updateMutation = useMutation({
    mutationFn: () =>
      client.collection.update({
        id: item.id,
        condition,
        quantity,
        notes: notes || null,
        is_tradeable: isTradeable,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: collectionKeys.all });
      onClose();
    },
  });

  const removeMutation = useMutation({
    mutationFn: () => client.collection.remove({ id: item.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: collectionKeys.all });
      onClose();
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">{item.card_name}</h3>
            <p className="text-sm text-muted-foreground">{item.set_name} · {item.card_number}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            &#10005;
          </button>
        </div>

        {item.image_url && (
          <img
            src={item.image_url}
            alt={item.card_name}
            className="mx-auto mb-4 h-48 rounded-lg object-contain"
          />
        )}

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Condition</label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value as z.infer<typeof CardConditionSchema>)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
            >
              {CONDITION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Quantity</label>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
            />
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isTradeable}
              onChange={(e) => setIsTradeable(e.target.checked)}
              className="rounded border-border"
            />
            <span className="text-sm text-foreground">Available for trade</span>
          </label>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <button
            type="button"
            onClick={() => removeMutation.mutate()}
            disabled={removeMutation.isPending}
            className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/20"
          >
            Delete
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border px-4 py-2 text-sm text-foreground"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => updateMutation.mutate()}
              disabled={updateMutation.isPending}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {updateMutation.isPending ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
