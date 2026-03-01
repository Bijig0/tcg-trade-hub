import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from '@/lib/orpc';
import { collectionKeys } from '../../queryKeys';
import type { z } from 'zod';
import type { TcgTypeSchema, CardConditionSchema, NormalizedCard } from '@tcg-trade-hub/database';

type AddCardFormProps = {
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

const CONDITION_OPTIONS: { value: z.infer<typeof CardConditionSchema>; label: string }[] = [
  { value: 'nm', label: 'Near Mint' },
  { value: 'lp', label: 'Lightly Played' },
  { value: 'mp', label: 'Moderately Played' },
  { value: 'hp', label: 'Heavily Played' },
  { value: 'dmg', label: 'Damaged' },
];

export const AddCardForm = ({ onSuccess }: AddCardFormProps) => {
  const queryClient = useQueryClient();
  const [tcg, setTcg] = useState<z.infer<typeof TcgTypeSchema>>('pokemon');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NormalizedCard[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedCard, setSelectedCard] = useState<NormalizedCard | null>(null);
  const [condition, setCondition] = useState<z.infer<typeof CardConditionSchema>>('nm');
  const [quantity, setQuantity] = useState(1);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const data = await client.card.search({ query: query.trim(), tcg });
      setResults(data);
      setSelectedCard(null);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const addMutation = useMutation({
    mutationFn: () => {
      if (!selectedCard) throw new Error('No card selected');
      return client.collection.add({
        user_id: '', // overridden server-side
        tcg: selectedCard.tcg,
        external_id: selectedCard.externalId,
        card_name: selectedCard.name,
        set_name: selectedCard.setName,
        set_code: selectedCard.setCode,
        card_number: selectedCard.number,
        image_url: selectedCard.imageUrl,
        rarity: selectedCard.rarity,
        market_price: selectedCard.marketPrice,
        condition,
        quantity,
        is_wishlist: false,
        is_tradeable: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: collectionKeys.all });
      setSelectedCard(null);
      setQuery('');
      setResults([]);
      onSuccess?.();
    },
  });

  return (
    <div className="space-y-4">
      {/* Search section */}
      <div className="flex gap-3">
        <select
          value={tcg}
          onChange={(e) => setTcg(e.target.value as z.infer<typeof TcgTypeSchema>)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
        >
          {TCG_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search for a card..."
          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
        />
        <button
          type="button"
          onClick={handleSearch}
          disabled={searching || !query.trim()}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {searching ? 'Searching...' : 'Search'}
        </button>
      </div>

      {/* Results grid */}
      {results.length > 0 && !selectedCard && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {results.map((card) => (
            <button
              key={card.externalId}
              type="button"
              onClick={() => setSelectedCard(card)}
              className="rounded-lg border border-border bg-card p-2 text-left transition-colors hover:border-primary"
            >
              {card.imageUrl && (
                <img
                  src={card.imageUrl}
                  alt={card.name}
                  className="mb-2 w-full rounded object-cover"
                />
              )}
              <div className="text-xs font-medium text-foreground line-clamp-1">{card.name}</div>
              <div className="text-xs text-muted-foreground">{card.setName}</div>
              {card.marketPrice != null && (
                <div className="mt-0.5 text-xs font-medium text-primary">${card.marketPrice.toFixed(2)}</div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Selected card form */}
      {selectedCard && (
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex gap-4">
            {selectedCard.imageUrl && (
              <img
                src={selectedCard.imageUrl}
                alt={selectedCard.name}
                className="h-40 rounded-lg object-contain"
              />
            )}
            <div className="flex-1 space-y-3">
              <div>
                <h4 className="font-semibold text-foreground">{selectedCard.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedCard.setName} · #{selectedCard.number}
                </p>
                {selectedCard.marketPrice != null && (
                  <p className="text-sm font-medium text-primary">
                    ${selectedCard.marketPrice.toFixed(2)}
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Condition</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as z.infer<typeof CardConditionSchema>)}
                    className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground"
                  >
                    {CONDITION_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Quantity</label>
                  <input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-20 rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCard(null)}
                  className="rounded-lg border border-border px-3 py-1.5 text-sm text-foreground"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => addMutation.mutate()}
                  disabled={addMutation.isPending}
                  className="rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {addMutation.isPending ? 'Adding...' : 'Add to Collection'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
