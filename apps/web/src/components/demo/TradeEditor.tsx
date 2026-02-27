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
  const [cashAmount, setCashAmount] = useState('');

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-3">
        <button
          type="button"
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Go back"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-sm font-semibold text-foreground">Build Your Offer</h2>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* TCG selector */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-2">
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
          <label className="block text-xs font-medium text-muted-foreground mb-2">
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

        {/* Card search */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-2">
            Search cards to add
          </label>
          <CardAutocomplete
            tcg={tcg}
            onSelect={onAddCard}
            selectedCard={null}
            onClear={() => {}}
          />
        </div>

        {/* Selected cards */}
        {selectedCards.length > 0 && (
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2">
              Your cards ({selectedCards.length})
            </label>
            <div className="space-y-2">
              {selectedCards.map((card) => (
                <CardPill
                  key={card.externalId}
                  card={card}
                  onRemove={onRemoveCard}
                />
              ))}
            </div>
          </div>
        )}

        {/* Cash amount (for buy/sell) */}
        {(listingType === 'wts' || listingType === 'wtb') && (
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2">
              {listingType === 'wts' ? 'Asking Price' : 'Budget'}{' '}
              <span className="text-muted-foreground/60">(optional)</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={cashAmount}
                onChange={(e) => setCashAmount(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-lg border border-input bg-background pl-7 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        )}
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
