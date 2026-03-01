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
  const [location, setLocation] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const markTouched = (field: string) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const emailError =
    !email.trim()
      ? 'Email is required'
      : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        ? 'Please enter a valid email'
        : null;

  const firstCard = selectedCards[0];

  const mutation = useMutation(
    orpc.preRegistration.create.mutationOptions(),
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true });
    if (emailError) return;

    mutation.mutate(
      {
        email,
        display_name: displayName || null,
        tcg: firstCard?.tcg ?? 'pokemon',
        card_name: firstCard?.name ?? 'Open to suggestions',
        card_set: firstCard?.setName ?? null,
        card_external_id: firstCard?.externalId ?? null,
        card_image_url: firstCard?.imageUrl ?? null,
        listing_type: listingType,
        city: location || null,
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
      <form noValidate onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
        <p className="text-sm text-muted-foreground">
          Enter your email to save your offer and get notified when TCG Trade Hub launches.
        </p>

        {/* Selected card preview */}
        {firstCard ? (
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
        ) : (
          <div className="flex items-center gap-3 rounded-lg border border-dashed border-border bg-secondary/20 p-3">
            <div className="flex h-14 w-10 shrink-0 items-center justify-center rounded bg-secondary">
              <svg className="h-6 w-6 text-muted-foreground/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
                <path d="M20 3v4M22 5h-4" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-muted-foreground">Open to suggestions</p>
              <p className="text-xs text-muted-foreground/70">We'll find cards for you</p>
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
            onBlur={() => markTouched('email')}
            placeholder="you@example.com"
            aria-invalid={touched.email && !!emailError}
            aria-describedby={touched.email && emailError ? 'demo-email-error' : undefined}
            className={`w-full rounded-lg border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 ${touched.email && emailError ? 'border-destructive ring-2 ring-destructive/30 focus:ring-destructive' : 'border-input focus:ring-ring'}`}
          />
          {touched.email && emailError && (
            <p id="demo-email-error" role="alert" className="mt-1 text-xs text-destructive">
              {emailError}
            </p>
          )}
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
        <div>
          <label htmlFor="demo-city" className="block text-xs font-medium text-foreground mb-1.5">
            City
          </label>
          <input
            id="demo-city"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="San Francisco"
            className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
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
          disabled={mutation.isPending}
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
