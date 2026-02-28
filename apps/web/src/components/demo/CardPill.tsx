import type { NormalizedCard } from '@tcg-trade-hub/database';

type CardPillProps = {
  card: NormalizedCard;
  onRemove: (externalId: string) => void;
};

export const CardPill = ({ card, onRemove }: CardPillProps) => {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5">
      <img
        src={card.imageUrl}
        alt={card.name}
        className="h-12 w-9 shrink-0 rounded object-cover shadow-sm"
      />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-foreground truncate leading-tight">
          {card.name}
        </p>
        {card.rarity && (
          <span className="mt-1 inline-block rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground leading-tight">
            {card.rarity}
          </span>
        )}
      </div>
      <span className="shrink-0 text-xs font-semibold text-foreground tabular-nums">
        {card.marketPrice != null ? `$${card.marketPrice.toFixed(2)}` : '--'}
      </span>
      <button
        type="button"
        onClick={() => onRemove(card.externalId)}
        className="shrink-0 rounded-full p-0.5 text-destructive/70 hover:text-destructive hover:bg-destructive/10 transition-colors"
        aria-label={`Remove ${card.name}`}
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};
