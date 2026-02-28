import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { orpc } from '@/lib/orpc';
import { CardAutocomplete } from './CardAutocomplete';
import { SuccessScreen } from './SuccessScreen';
import type { NormalizedCard, TcgType, ListingType } from '@tcg-trade-hub/database';

const TCG_OPTIONS: { value: TcgType; label: string }[] = [
  { value: 'pokemon', label: 'Pokemon' },
  { value: 'mtg', label: 'Magic: The Gathering' },
  { value: 'yugioh', label: 'Yu-Gi-Oh!' },
];

const INTEREST_OPTIONS: {
  id: string;
  label: string;
  description: string;
  getListingType: () => ListingType;
}[] = [
  { id: 'sell', label: 'I want to sell cards', description: 'List cards for cash', getListingType: () => 'wts' },
  { id: 'trade', label: 'I want to trade cards', description: 'Swap cards with others', getListingType: () => 'wtt' },
  { id: 'buy', label: "I'm looking to buy specific cards", description: 'Find cards to purchase', getListingType: () => 'wtb' },
];

export const PreRegistrationForm = () => {
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [tcg, setTcg] = useState<TcgType>('pokemon');
  const [selectedCard, setSelectedCard] = useState<NormalizedCard | null>(null);
  const [cardName, setCardName] = useState('');
  const [interests, setInterests] = useState<Set<string>>(new Set());
  const [askingPrice, setAskingPrice] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');

  const mutation = useMutation(
    orpc.preRegistration.create.mutationOptions(),
  );

  const toggleInterest = (id: string) => {
    setInterests((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Derive listing_type from interests for backward compat with pre_registrations table
  const derivedListingType = (): ListingType => {
    if (interests.has('sell')) return 'wts';
    if (interests.has('trade')) return 'wtt';
    if (interests.has('buy')) return 'wtb';
    return 'wtt'; // default
  };

  const showPrice = interests.has('sell') || interests.has('buy');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    mutation.mutate({
      email,
      display_name: displayName || null,
      tcg,
      card_name: selectedCard?.name ?? cardName,
      card_set: selectedCard?.setName ?? null,
      card_external_id: selectedCard?.externalId ?? null,
      card_image_url: selectedCard?.imageUrl ?? null,
      listing_type: derivedListingType(),
      asking_price: askingPrice ? parseFloat(askingPrice) : null,
      city: city || null,
      zip_code: zipCode || null,
    });
  };

  const handleReset = () => {
    mutation.reset();
    setEmail('');
    setDisplayName('');
    setTcg('pokemon');
    setSelectedCard(null);
    setCardName('');
    setInterests(new Set());
    setAskingPrice('');
    setCity('');
    setZipCode('');
  };

  if (mutation.isSuccess) {
    return (
      <SuccessScreen
        position={mutation.data.position}
        email={email}
        onReset={handleReset}
      />
    );
  }

  const resolvedCardName = selectedCard?.name ?? cardName;

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-lg space-y-5">
      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
          Email <span className="text-destructive">*</span>
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Display Name */}
      <div>
        <label htmlFor="displayName" className="block text-sm font-medium text-foreground mb-1.5">
          Display Name <span className="text-muted-foreground text-xs">(optional)</span>
        </label>
        <input
          id="displayName"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="TraderJoe"
          className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* TCG Selector */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Which TCG? <span className="text-destructive">*</span>
        </label>
        <div className="flex gap-2">
          {TCG_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                setTcg(option.value);
                setSelectedCard(null);
                setCardName('');
              }}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
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

      {/* Card Search */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          What card? <span className="text-destructive">*</span>
        </label>
        <CardAutocomplete
          tcg={tcg}
          onSelect={(card) => {
            setSelectedCard(card);
            setCardName(card.name);
          }}
          selectedCard={selectedCard}
          onClear={() => {
            setSelectedCard(null);
            setCardName('');
          }}
        />
        {!selectedCard && (
          <input
            type="text"
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
            placeholder="Or type card name manually"
            className="mt-2 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        )}
      </div>

      {/* Interest Checkboxes (replacing WTS/WTB/WTT radio) */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          What are you interested in? <span className="text-destructive">*</span>
        </label>
        <div className="space-y-2">
          {INTEREST_OPTIONS.map((option) => (
            <label
              key={option.id}
              className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                interests.has(option.id)
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-background hover:bg-accent'
              }`}
            >
              <input
                type="checkbox"
                checked={interests.has(option.id)}
                onChange={() => toggleInterest(option.id)}
                className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
              />
              <div>
                <span className="block text-sm font-medium text-foreground">{option.label}</span>
                <span className="block text-xs text-muted-foreground">{option.description}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Asking Price — shown for sell or buy interests */}
      {showPrice && (
        <div>
          <label htmlFor="askingPrice" className="block text-sm font-medium text-foreground mb-1.5">
            {interests.has('sell') ? 'Asking Price' : 'Budget'}
            {' '}
            <span className="text-muted-foreground text-xs">(optional)</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
            <input
              id="askingPrice"
              type="number"
              step="0.01"
              min="0"
              value={askingPrice}
              onChange={(e) => setAskingPrice(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-lg border border-input bg-background pl-7 pr-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
      )}

      {/* Location */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-foreground mb-1.5">
            City
          </label>
          <input
            id="city"
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="San Francisco"
            className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label htmlFor="zipCode" className="block text-sm font-medium text-foreground mb-1.5">
            Zip Code
          </label>
          <input
            id="zipCode"
            type="text"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            placeholder="94102"
            className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* Error */}
      {mutation.isError && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {mutation.error.message || 'Something went wrong. Please try again.'}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={mutation.isPending || !email || !resolvedCardName || interests.size === 0}
        className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {mutation.isPending ? 'Registering...' : 'Get Early Access'}
      </button>

      <p className="text-center text-xs text-muted-foreground">
        No spam, ever. We'll only email when we launch in your area.
      </p>
    </form>
  );
};
