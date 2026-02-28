import { useState } from 'react';
import type { NormalizedCard, ListingType } from '@tcg-trade-hub/database';
import { CardAutocomplete } from '@/components/CardAutocomplete';
import { CardPill } from './CardPill';

export type OfferItem =
  | { type: 'card'; card: NormalizedCard }
  | { type: 'custom'; id: string; text: string };

export const offerItemId = (item: OfferItem): string =>
  item.type === 'card' ? item.card.externalId : item.id;

export const flattenToCards = (items: OfferItem[]): NormalizedCard[] =>
  items.flatMap((i) => (i.type === 'card' ? [i.card] : []));

const LISTING_TYPE_OPTIONS: { value: ListingType; label: string }[] = [
  { value: 'wtt', label: 'Trade' },
  { value: 'wtb', label: 'Buy' },
  { value: 'wts', label: 'Sell' },
];

type TradeEditorProps = {
  listingType: ListingType;
  myOfferItems: OfferItem[];
  theirOfferItems: OfferItem[];
  onMyOfferItemsChange: (items: OfferItem[]) => void;
  onTheirOfferItemsChange: (items: OfferItem[]) => void;
  onListingTypeChange: (type: ListingType) => void;
  onSubmit: () => void;
  onBack: () => void;
};

type OfferSectionProps = {
  label: string;
  items: OfferItem[];
  onItemsChange: (items: OfferItem[]) => void;
  enableCash?: boolean;
  borderColor: string;
  dotColor: string;
};

const OfferSection = ({
  label,
  items,
  onItemsChange,
  enableCash = false,
  borderColor,
  dotColor,
}: OfferSectionProps) => {
  const [showCash, setShowCash] = useState(false);
  const [cashAmount, setCashAmount] = useState('');

  const handleAddCard = (card: NormalizedCard) => {
    if (items.some((i) => i.type === 'card' && i.card.externalId === card.externalId)) return;
    onItemsChange([...items, { type: 'card', card }]);
  };

  const handleAddCustom = (text: string) => {
    onItemsChange([...items, { type: 'custom', id: crypto.randomUUID(), text }]);
  };

  const handleRemove = (id: string) => {
    onItemsChange(items.filter((i) => offerItemId(i) !== id));
  };

  const handleClear = () => {
    onItemsChange([]);
    setShowCash(false);
    setCashAmount('');
  };

  const cardTotal = items.reduce(
    (sum, i) => sum + (i.type === 'card' ? (i.card.marketPrice ?? 0) : 0),
    0,
  );
  const cashValue = showCash ? parseFloat(cashAmount) || 0 : 0;
  const cardCount = items.filter((i) => i.type === 'card').length;
  const customCount = items.filter((i) => i.type === 'custom').length;

  const itemCountLabel = [
    cardCount > 0 ? `${cardCount} ${cardCount === 1 ? 'card' : 'cards'}` : null,
    customCount > 0 ? `${customCount} custom` : null,
  ]
    .filter(Boolean)
    .join(' + ');

  return (
    <div className={`rounded-xl border-2 ${borderColor} bg-card overflow-hidden`}>
      {/* Section header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${dotColor}`} />
          <span className="text-xs font-bold uppercase tracking-wider text-foreground">
            {label}
          </span>
        </div>
        {items.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="text-[11px] font-medium text-destructive hover:text-destructive/80 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      <div className="border-t border-border/50" />

      {/* Item rows */}
      {items.length > 0 && (
        <div>
          {items.map((item, i) => (
            <div key={offerItemId(item)}>
              {item.type === 'card' ? (
                <CardPill card={item.card} onRemove={(id) => handleRemove(id)} />
              ) : (
                <div className="flex items-center gap-3 px-3 py-2.5">
                  <div className="flex h-12 w-9 shrink-0 items-center justify-center rounded bg-secondary">
                    <svg className="h-5 w-5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-foreground truncate leading-tight">
                      {item.text}
                    </p>
                    <span className="mt-1 inline-block rounded bg-violet-500/15 px-1.5 py-0.5 text-[10px] font-medium text-violet-400 leading-tight">
                      Custom item
                    </span>
                  </div>
                  <span className="shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">
                    --
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemove(item.id)}
                    className="shrink-0 rounded-full p-0.5 text-destructive/70 hover:text-destructive hover:bg-destructive/10 transition-colors"
                    aria-label={`Remove ${item.text}`}
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
              {i < items.length - 1 && (
                <div className="mx-3 border-t border-border/40" />
              )}
            </div>
          ))}
          <div className="mx-3 border-t border-border/40" />
        </div>
      )}

      {/* Card search */}
      <div className="px-3 py-2">
        <CardAutocomplete
          tcg="pokemon"
          onSelect={handleAddCard}
          selectedCard={null}
          onClear={() => {}}
          onAddCustomText={handleAddCustom}
        />
      </div>

      {/* Add Cash button */}
      {enableCash && !showCash && (
        <div className="px-3 pb-3 pt-1">
          <button
            type="button"
            onClick={() => setShowCash(true)}
            className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border py-2.5 text-xs font-medium text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
            </svg>
            Add Cash
          </button>
        </div>
      )}

      {/* Cash input */}
      {enableCash && showCash && (
        <div className="px-3 pb-3 pt-1">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={cashAmount}
                onChange={(e) => setCashAmount(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-lg border border-input bg-background pl-7 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setShowCash(false);
                setCashAmount('');
              }}
              className="shrink-0 rounded-lg p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              aria-label="Remove cash"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Total value footer */}
      <div className="border-t border-border/50 bg-secondary/30 px-4 py-3">
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Total Value
            </p>
            <p className="text-[10px] text-muted-foreground/70">
              {itemCountLabel || '0 items'}
              {showCash && cashAmount ? ' + cash' : ''}
            </p>
          </div>
          <span className="text-base font-bold text-primary tabular-nums">
            ${(cardTotal + cashValue).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};

type CashOnlySectionProps = {
  label: string;
  borderColor: string;
  dotColor: string;
};

const CashOnlySection = ({ label, borderColor, dotColor }: CashOnlySectionProps) => {
  return (
    <div className={`rounded-xl border-2 ${borderColor} bg-card overflow-hidden`}>
      {/* Section header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${dotColor}`} />
          <span className="text-xs font-bold uppercase tracking-wider text-foreground">
            {label}
          </span>
        </div>
      </div>

      <div className="border-t border-border/50" />

      {/* Cash indicator */}
      <div className="flex flex-col items-center gap-2 px-4 py-6">
        <svg className="h-10 w-10 text-muted-foreground/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
        </svg>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Cash
        </span>
      </div>
    </div>
  );
};

export const TradeEditor = ({
  listingType,
  myOfferItems,
  theirOfferItems,
  onMyOfferItemsChange,
  onTheirOfferItemsChange,
  onListingTypeChange,
  onSubmit,
  onBack,
}: TradeEditorProps) => {
  const isSubmitDisabled =
    (listingType === 'wtt' && (myOfferItems.length === 0 || theirOfferItems.length === 0)) ||
    (listingType === 'wts' && myOfferItems.length === 0) ||
    (listingType === 'wtb' && theirOfferItems.length === 0);

  return (
    <div className="flex flex-1 flex-col overflow-hidden min-h-0">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-3">
        <button
          type="button"
          onClick={onBack}
          className="text-primary hover:text-primary/80 transition-colors"
          aria-label="Go back"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-sm font-semibold text-foreground">Trade Details</h2>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Listing type selector */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            I want to...
          </label>
          <div className="flex gap-2">
            {LISTING_TYPE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onListingTypeChange(option.value)}
                className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                  listingType === option.value
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background text-foreground hover:bg-accent'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* MY OFFER section */}
        {listingType === 'wtb' ? (
          <CashOnlySection label="My Offer" borderColor="border-primary" dotColor="bg-primary" />
        ) : (
          <OfferSection
            label="My Offer"
            items={myOfferItems}
            onItemsChange={onMyOfferItemsChange}
            enableCash
            borderColor="border-primary"
            dotColor="bg-primary"
          />
        )}

        {/* THEIR OFFER section */}
        {listingType === 'wts' ? (
          <CashOnlySection label="Their Offer" borderColor="border-violet-400" dotColor="bg-violet-400" />
        ) : (
          <OfferSection
            label="Their Offer"
            items={theirOfferItems}
            onItemsChange={onTheirOfferItemsChange}
            borderColor="border-violet-400"
            dotColor="bg-violet-400"
          />
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-border bg-card p-4">
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitDisabled}
          className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send Offer
        </button>
      </div>
    </div>
  );
};
