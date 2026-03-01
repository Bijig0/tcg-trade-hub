import { useState, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from '@/lib/orpc';
import { listingKeys } from '../../queryKeys';
import { CardSelector } from '../CardSelector/CardSelector';
import { ListingTypeBadge } from '../ListingTypeBadge/ListingTypeBadge';
import { deriveListingType } from '../../utils/deriveListingType/deriveListingType';
import type { z } from 'zod';
import type {
  TcgTypeSchema,
  ListingTypeSchema,
  ListingCategorySchema,
  CollectionItemRowSchema,
} from '@tcg-trade-hub/database';

type CollectionItem = z.infer<typeof CollectionItemRowSchema>;

type SelectedItem = CollectionItem & {
  asking_price: number | null;
};

type CreateListingFormProps = {
  onSuccess?: () => void;
};

const TCG_OPTIONS: { value: z.infer<typeof TcgTypeSchema>; label: string }[] = [
  { value: 'pokemon', label: 'Pokemon' },
  { value: 'mtg', label: 'MTG' },
  { value: 'onepiece', label: 'One Piece' },
  { value: 'lorcana', label: 'Lorcana' },
  { value: 'fab', label: 'Flesh & Blood' },
  { value: 'starwars', label: 'Star Wars' },
];

const CATEGORY_OPTIONS: { value: z.infer<typeof ListingCategorySchema>; label: string }[] = [
  { value: 'singles', label: 'Singles' },
  { value: 'sealed', label: 'Sealed' },
  { value: 'graded', label: 'Graded' },
  { value: 'bulk', label: 'Bulk' },
];

export const CreateListingForm = ({ onSuccess }: CreateListingFormProps) => {
  const queryClient = useQueryClient();
  const [tcg, setTcg] = useState<z.infer<typeof TcgTypeSchema>>('pokemon');
  const [category, setCategory] = useState<z.infer<typeof ListingCategorySchema>>('singles');
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [cashAmount, setCashAmount] = useState(0);
  const [description, setDescription] = useState('');
  const [acceptsCash, setAcceptsCash] = useState(true);
  const [acceptsTrades, setAcceptsTrades] = useState(false);
  const [typeOverride, setTypeOverride] = useState<z.infer<typeof ListingTypeSchema> | ''>('');

  const derivedType = useMemo(
    () => deriveListingType({
      hasCards: selectedItems.length > 0,
      acceptsCash,
      acceptsTrades,
    }),
    [selectedItems.length, acceptsCash, acceptsTrades],
  );

  const listingType = (typeOverride || derivedType) as z.infer<typeof ListingTypeSchema>;

  const createMutation = useMutation({
    mutationFn: () => {
      const items = selectedItems.map((item) => ({
        card_name: item.card_name,
        card_image_url: item.image_url,
        card_external_id: item.external_id,
        tcg: item.tcg,
        card_set: item.set_name,
        card_number: item.card_number,
        card_rarity: item.rarity,
        condition: item.condition,
        market_price: item.market_price,
        asking_price: item.asking_price,
        quantity: item.quantity,
        collection_item_id: item.id,
      }));

      return client.listing.create({
        type: listingType,
        tcg,
        category,
        items,
        cash_amount: cashAmount,
        description: description || null,
        accepts_cash: acceptsCash,
        accepts_trades: acceptsTrades,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: listingKeys.all });
      onSuccess?.();
    },
  });

  return (
    <div className="space-y-6">
      {/* Section 1: Card Selection */}
      <section className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground">1. Select Cards</h3>
        <div className="flex gap-3">
          <select
            value={tcg}
            onChange={(e) => {
              setTcg(e.target.value as z.infer<typeof TcgTypeSchema>);
              setSelectedItems([]);
            }}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
          >
            {TCG_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as z.infer<typeof ListingCategorySchema>)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
          >
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <CardSelector
          tcg={tcg}
          selectedItems={selectedItems}
          onSelectionChange={setSelectedItems}
        />
      </section>

      {/* Section 2: Pricing */}
      <section className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground">2. Pricing</h3>
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">Cash Amount ($)</label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={cashAmount}
            onChange={(e) => setCashAmount(parseFloat(e.target.value) || 0)}
            className="w-40 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
          />
        </div>
      </section>

      {/* Section 3: Details */}
      <section className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground">3. Details</h3>

        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Type:</span>
          <ListingTypeBadge type={listingType} />
          <select
            value={typeOverride}
            onChange={(e) => setTypeOverride(e.target.value as z.infer<typeof ListingTypeSchema> | '')}
            className="rounded-lg border border-border bg-background px-2 py-1 text-xs text-foreground"
          >
            <option value="">Auto-derive</option>
            <option value="wts">WTS (Want to Sell)</option>
            <option value="wtb">WTB (Want to Buy)</option>
            <option value="wtt">WTT (Want to Trade)</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Describe your listing..."
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={acceptsCash}
              onChange={(e) => setAcceptsCash(e.target.checked)}
              className="rounded border-border"
            />
            <span className="text-sm text-foreground">Accepts Cash</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={acceptsTrades}
              onChange={(e) => setAcceptsTrades(e.target.checked)}
              className="rounded border-border"
            />
            <span className="text-sm text-foreground">Accepts Trades</span>
          </label>
        </div>
      </section>

      {/* Submit */}
      <div className="flex items-center gap-3 border-t border-border pt-4">
        <button
          type="button"
          onClick={() => createMutation.mutate()}
          disabled={selectedItems.length === 0 || createMutation.isPending}
          className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {createMutation.isPending ? 'Creating...' : 'Create Listing'}
        </button>
        {createMutation.isError && (
          <p className="text-sm text-destructive">
            {(createMutation.error as Error).message}
          </p>
        )}
      </div>
    </div>
  );
};
