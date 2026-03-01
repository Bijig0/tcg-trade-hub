import type { z } from 'zod';
import type { TcgTypeSchema, CardConditionSchema } from '@tcg-trade-hub/database';

type CollectionFiltersProps = {
  tcg: z.infer<typeof TcgTypeSchema> | undefined;
  condition: z.infer<typeof CardConditionSchema> | undefined;
  isTradeable: boolean | undefined;
  search: string;
  onTcgChange: (tcg: z.infer<typeof TcgTypeSchema> | undefined) => void;
  onConditionChange: (condition: z.infer<typeof CardConditionSchema> | undefined) => void;
  onTradeableChange: (value: boolean | undefined) => void;
  onSearchChange: (search: string) => void;
};

const TCG_OPTIONS = [
  { value: '', label: 'All TCGs' },
  { value: 'pokemon', label: 'Pokemon' },
  { value: 'mtg', label: 'MTG' },
  { value: 'onepiece', label: 'One Piece' },
  { value: 'lorcana', label: 'Lorcana' },
  { value: 'fab', label: 'Flesh & Blood' },
  { value: 'starwars', label: 'Star Wars' },
];

const CONDITION_OPTIONS = [
  { value: '', label: 'All Conditions' },
  { value: 'nm', label: 'Near Mint' },
  { value: 'lp', label: 'Lightly Played' },
  { value: 'mp', label: 'Moderately Played' },
  { value: 'hp', label: 'Heavily Played' },
  { value: 'dmg', label: 'Damaged' },
];

const TRADEABLE_OPTIONS = [
  { value: '', label: 'All Items' },
  { value: 'true', label: 'Tradeable' },
  { value: 'false', label: 'Not Tradeable' },
];

export const CollectionFilters = ({
  tcg,
  condition,
  isTradeable,
  search,
  onTcgChange,
  onConditionChange,
  onTradeableChange,
  onSearchChange,
}: CollectionFiltersProps) => {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <input
        type="text"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search cards..."
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground sm:w-64"
      />
      <select
        value={tcg ?? ''}
        onChange={(e) => onTcgChange(e.target.value || undefined)}
        className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
      >
        {TCG_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <select
        value={condition ?? ''}
        onChange={(e) => onConditionChange(e.target.value || undefined)}
        className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
      >
        {CONDITION_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <select
        value={isTradeable === undefined ? '' : String(isTradeable)}
        onChange={(e) => onTradeableChange(e.target.value === '' ? undefined : e.target.value === 'true')}
        className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
      >
        {TRADEABLE_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
};
