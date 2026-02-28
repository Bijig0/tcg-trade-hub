import { useState } from 'react';
import type { NormalizedCard, TcgType, ListingType } from '@tcg-trade-hub/database';
import { CardAutocomplete } from '@/components/CardAutocomplete';
import { CardPill } from './CardPill';

const TCG_OPTIONS: { value: TcgType; label: string }[] = [
  { value: 'pokemon', label: 'Pokemon' },
  { value: 'mtg', label: 'MTG' },
  { value: 'yugioh', label: "Yu-Gi-Oh!" },
];

const LISTING_TYPE_OPTIONS: { value: ListingType; label: string }[] = [
  { value: 'wtt', label: 'Trade' },
  { value: 'wtb', label: 'Buy' },
  { value: 'wts', label: 'Sell' },
];

type TradeEditorProps = {
  selectedCards: NormalizedCard[];
  tcg: TcgType;
  listingType: ListingType;
  onTcgChange: (tcg: TcgType) => void;
  onListingTypeChange: (type: ListingType) => void;
  onAddCard: (card: NormalizedCard) => void;
  onRemoveCard: (externalId: string) => void;
  onSubmit: () => void;
  onBack: () => void;
};

export const TradeEditor = ({
  selectedCards,
  tcg,
  listingType,
  onTcgChange,
  onListingTypeChange,
  onAddCard,
  onRemoveCard,
  onSubmit,
  onBack,
}: TradeEditorProps) => {
  const [showCash, setShowCash] = useState(false);
  const [cashAmount, setCashAmount] = useState('');

  const totalValue = selectedCards.reduce(
    (sum, c) => sum + (c.marketPrice ?? 0),
    0,
  );

  const handleClear = () => {
    selectedCards.forEach((c) => onRemoveCard(c.externalId));
    setShowCash(false);
    setCashAmount('');
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
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
        {/* TCG selector */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            TCG
          </label>
          <div className="flex gap-2">
            {TCG_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onTcgChange(option.value)}
                className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                  tcg === option.value
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background text-foreground hover:bg-accent'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

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

        {/* Offer card section */}
        <div className="rounded-xl border-2 border-primary bg-card overflow-hidden">
          {/* Section header */}
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-primary" />
              <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                My Offer
              </span>
            </div>
            {selectedCards.length > 0 && (
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

          {/* Card rows */}
          {selectedCards.length > 0 && (
            <div>
              {selectedCards.map((card, i) => (
                <div key={card.externalId}>
                  <CardPill card={card} onRemove={onRemoveCard} />
                  {i < selectedCards.length - 1 && (
                    <div className="mx-3 border-t border-border/40" />
                  )}
                </div>
              ))}
              <div className="mx-3 border-t border-border/40" />
            </div>
          )}

          {/* Card search (always visible inside the offer card) */}
          <div className="px-3 py-2">
            <CardAutocomplete
              tcg={tcg}
              onSelect={onAddCard}
              selectedCard={null}
              onClear={() => {}}
            />
          </div>

          {/* Add Cash button */}
          {!showCash && (
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

          {/* Cash input (when toggled) */}
          {showCash && (
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
                  {selectedCards.length} {selectedCards.length === 1 ? 'card' : 'cards'}
                  {showCash && cashAmount ? ' + cash' : ''}
                </p>
              </div>
              <span className="text-base font-bold text-primary tabular-nums">
                ${(totalValue + (showCash ? parseFloat(cashAmount) || 0 : 0)).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border bg-card p-4">
        <button
          type="button"
          onClick={onSubmit}
          disabled={selectedCards.length === 0}
          className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send Offer
        </button>
      </div>
    </div>
  );
};
