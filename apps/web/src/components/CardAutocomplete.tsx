import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { orpc } from '@/lib/orpc';
import type { NormalizedCard, TcgType } from '@tcg-trade-hub/database';

type CardAutocompleteProps = {
  tcg: TcgType;
  onSelect: (card: NormalizedCard) => void;
  selectedCard: NormalizedCard | null;
  onClear: () => void;
  onAddCustomText?: (text: string) => void;
};

export const CardAutocomplete = ({
  tcg,
  onSelect,
  selectedCard,
  onClear,
  onAddCustomText,
}: CardAutocompleteProps) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 500);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const { data: cards = [], isFetching } = useQuery({
    ...orpc.card.search.queryOptions({
      input: { query: debouncedQuery, tcg },
    }),
    enabled: debouncedQuery.length >= 2,
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev,
  });

  const handleSelect = (card: NormalizedCard) => {
    onSelect(card);
    setQuery('');
    setIsOpen(false);
  };

  if (selectedCard) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-border bg-secondary/50 p-3">
        {selectedCard.imageUrl ? (
          <img
            src={selectedCard.imageUrl}
            alt={selectedCard.name}
            className="h-16 w-12 rounded object-cover"
          />
        ) : (
          <div className="h-16 w-12 rounded bg-muted flex items-center justify-center">
            <span className="text-[10px] text-muted-foreground">No img</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground truncate">{selectedCard.name}</p>
          <p className="text-sm text-muted-foreground truncate">
            {selectedCard.setName}
            {selectedCard.rarity && selectedCard.rarity !== 'Unknown' && ` \u00b7 ${selectedCard.rarity}`}
          </p>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="shrink-0 text-sm text-muted-foreground hover:text-foreground"
        >
          Change
        </button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => query.length >= 2 && setIsOpen(true)}
        placeholder="Search for a card..."
        className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />
      {isFetching && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}
      {isOpen && cards.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full rounded-lg border border-border bg-card shadow-lg max-h-64 overflow-y-auto">
          {cards.map((card) => (
            <li key={card.externalId}>
              <button
                type="button"
                onClick={() => handleSelect(card)}
                className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-accent transition-colors"
              >
                {card.imageUrl ? (
                  <img
                    src={card.imageUrl}
                    alt={card.name}
                    className="h-12 w-9 rounded object-cover"
                  />
                ) : (
                  <div className="h-12 w-9 rounded bg-muted flex items-center justify-center">
                    <span className="text-[8px] text-muted-foreground">No img</span>
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{card.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {card.setName}
                    {card.rarity && card.rarity !== 'Unknown' && ` \u00b7 ${card.rarity}`}
                    {card.marketPrice != null && ` \u00b7 $${card.marketPrice.toFixed(2)}`}
                  </p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
      {isOpen && debouncedQuery.length >= 2 && !isFetching && cards.length === 0 && (
        <div className="absolute z-10 mt-1 w-full rounded-lg border border-border bg-card shadow-lg">
          {onAddCustomText ? (
            <button
              type="button"
              onClick={() => {
                onAddCustomText(query);
                setQuery('');
                setIsOpen(false);
              }}
              className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm hover:bg-accent transition-colors"
            >
              <svg className="h-4 w-4 shrink-0 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
              <span className="text-foreground">
                Add &lsquo;<span className="font-medium">{query}</span>&rsquo; as custom item
              </span>
            </button>
          ) : (
            <p className="p-4 text-center text-sm text-muted-foreground">
              No cards found
            </p>
          )}
        </div>
      )}
    </div>
  );
};
