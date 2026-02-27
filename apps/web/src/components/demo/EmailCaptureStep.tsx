import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { orpc } from '@/lib/orpc';
import type { NormalizedCard, ListingType } from '@tcg-trade-hub/database';

type EmailCaptureStepProps = {
  selectedCards: NormalizedCard[];
  listingType: ListingType;
  onSuccess: (position: number, email: string) => void;
  onBack: () => void;
};

export const EmailCaptureStep = ({
  selectedCards,
  listingType,
  onSuccess,
  onBack,
}: EmailCaptureStepProps) => {
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');

  const firstCard = selectedCards[0];

  const mutation = useMutation(
    orpc.preRegistration.create.mutationOptions(),
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstCard) return;

    mutation.mutate(
      {
        email,
        display_name: displayName || null,
        tcg: firstCard.tcg,
        card_name: firstCard.name,
        card_set: firstCard.setName ?? null,
        card_external_id: firstCard.externalId ?? null,
        card_image_url: firstCard.imageUrl ?? null,
        listing_type: listingType,
        asking_price: null,
        city: city || null,
        zip_code: zipCode || null,
      },
      {
        onSuccess: (data) => {
          onSuccess(data.position, email);
        },
      },
    );
  };

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
        <h2 className="text-sm font-semibold text-foreground">Complete Registration</h2>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
        <p className="text-sm text-muted-foreground">
          Enter your email to save your offer and get notified when TCG Trade Hub launches.
        </p>

        {/* Selected card preview */}
        {firstCard && (
          <div className="flex items-center gap-3 rounded-lg border border-border bg-secondary/50 p-3">
            <img
              src={firstCard.imageUrl}
              alt={firstCard.name}
              className="h-14 w-10 rounded object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground truncate">{firstCard.name}</p>
              <p className="text-xs text-muted-foreground truncate">{firstCard.setName}</p>
              {selectedCards.length > 1 && (
                <p className="text-xs text-primary">+{selectedCards.length - 1} more</p>
              )}
            </div>
          </div>
        )}

        {/* Email */}
        <div>
          <label htmlFor="demo-email" className="block text-xs font-medium text-foreground mb-1.5">
            Email <span className="text-destructive">*</span>
          </label>
          <input
            id="demo-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Display Name */}
        <div>
          <label htmlFor="demo-name" className="block text-xs font-medium text-foreground mb-1.5">
            Display Name <span className="text-muted-foreground text-xs">(optional)</span>
          </label>
          <input
            id="demo-name"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="TraderJoe"
            className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Location */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="demo-city" className="block text-xs font-medium text-foreground mb-1.5">
              City
            </label>
            <input
              id="demo-city"
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="San Francisco"
              className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label htmlFor="demo-zip" className="block text-xs font-medium text-foreground mb-1.5">
              Zip Code
            </label>
            <input
              id="demo-zip"
              type="text"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              placeholder="94102"
              className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {/* Error */}
        {mutation.isError && (
          <div className="rounded-lg bg-destructive/10 p-3 text-xs text-destructive">
            {mutation.error.message || 'Something went wrong. Please try again.'}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={mutation.isPending || !email}
          className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {mutation.isPending ? 'Registering...' : 'Get Early Access'}
        </button>

        <p className="text-center text-[10px] text-muted-foreground">
          No spam, ever. We'll only email when we launch in your area.
        </p>
      </form>
    </div>
  );
};
