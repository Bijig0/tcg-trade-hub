type DemoOfferCardProps = {
  onCounterOffer: () => void;
};

type OfferCardItem = {
  name: string;
  set: string;
  price: string;
};

const offeringCards: OfferCardItem[] = [
  { name: 'Charizard ex', set: '151', price: '$185' },
];

const requestingCards: OfferCardItem[] = [
  { name: 'Umbreon ex', set: 'Obsidian Flames', price: '$95' },
  { name: 'Mew ex', set: '151', price: '$35' },
];

const CardChip = ({ card }: { card: OfferCardItem }) => (
  <div className="flex items-center gap-2 rounded-lg bg-background/60 px-3 py-2">
    <div className="h-8 w-6 rounded bg-primary/20 text-[8px] flex items-center justify-center text-primary font-bold">
      TCG
    </div>
    <div className="min-w-0">
      <p className="text-xs font-medium text-foreground truncate">{card.name}</p>
      <p className="text-[10px] text-muted-foreground">{card.set} &middot; {card.price}</p>
    </div>
  </div>
);

export const DemoOfferCard = ({ onCounterOffer }: DemoOfferCardProps) => {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="bg-primary/10 px-4 py-2.5">
        <p className="text-xs font-semibold text-primary">Trade Offer</p>
      </div>

      <div className="space-y-3 p-4">
        {/* Offering */}
        <div>
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Offering
          </p>
          <div className="space-y-1.5">
            {offeringCards.map((card) => (
              <CardChip key={card.name} card={card} />
            ))}
          </div>
        </div>

        {/* Divider with arrow */}
        <div className="flex items-center gap-2">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">&darr;</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Requesting */}
        <div>
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Requesting
          </p>
          <div className="space-y-1.5">
            {requestingCards.map((card) => (
              <CardChip key={card.name} card={card} />
            ))}
          </div>
        </div>

        {/* Cash supplement */}
        <div className="flex items-center gap-2 rounded-lg bg-success/10 px-3 py-2">
          <span className="text-sm">&#128176;</span>
          <p className="text-xs font-medium text-success">+ $50 cash</p>
        </div>

        {/* CTA */}
        <button
          type="button"
          onClick={onCounterOffer}
          className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Make Your Counter-Offer
        </button>
      </div>
    </div>
  );
};
