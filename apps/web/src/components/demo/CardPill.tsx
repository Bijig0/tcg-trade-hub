import type { NormalizedCard } from '@tcg-trade-hub/database';

type CardPillProps = {
  card: NormalizedCard;
  onRemove: (externalId: string) => void;
};

export const CardPill = ({ card, onRemove }: CardPillProps) => {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary/50 px-3 py-2">
      <img
        src={card.imageUrl}
        alt={card.name}
        className="h-10 w-7 rounded object-cover"
      />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-foreground truncate">{card.name}</p>
        <p className="text-[10px] text-muted-foreground truncate">
          {card.setName}
          {card.marketPrice != null && ` · $${card.marketPrice.toFixed(2)}`}
        </p>
      </div>
      <button
        type="button"
        onClick={() => onRemove(card.externalId)}
        className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
        aria-label={`Remove ${card.name}`}
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};
