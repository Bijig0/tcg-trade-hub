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

const LISTING_TYPE_OPTIONS: { value: ListingType; label: string; description: string }[] = [
  { value: 'wtt', label: 'Trade', description: 'Looking to trade' },
  { value: 'wtb', label: 'Buy', description: 'Looking to buy' },
  { value: 'wts', label: 'Sell', description: 'Looking to sell' },
];

export const PreRegistrationForm = () => {
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [tcg, setTcg] = useState<TcgType>('pokemon');
  const [selectedCard, setSelectedCard] = useState<NormalizedCard | null>(null);
  const [cardName, setCardName] = useState('');
  const [listingType, setListingType] = useState<ListingType>('wtt');
  const [askingPrice, setAskingPrice] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');

  const mutation = useMutation(
    orpc.preRegistration.create.mutationOptions(),
  );

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
      listing_type: listingType,
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
    setListingType('wtt');
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

      {/* Listing Type */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          What do you want to do? <span className="text-destructive">*</span>
        </label>
        <div className="flex gap-2">
          {LISTING_TYPE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setListingType(option.value)}
              className={`flex-1 rounded-lg border px-3 py-2.5 text-center transition-colors ${
                listingType === option.value
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background text-foreground hover:bg-accent'
              }`}
            >
              <span className="block text-sm font-medium">{option.label}</span>
              <span className={`block text-xs ${
                listingType === option.value ? 'text-primary-foreground/70' : 'text-muted-foreground'
              }`}>
                {option.description}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Asking Price — shown for WTS and optionally for WTB */}
      {(listingType === 'wts' || listingType === 'wtb') && (
        <div>
          <label htmlFor="askingPrice" className="block text-sm font-medium text-foreground mb-1.5">
            {listingType === 'wts' ? 'Asking Price' : 'Budget'}
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
        disabled={mutation.isPending || !email || !resolvedCardName}
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
