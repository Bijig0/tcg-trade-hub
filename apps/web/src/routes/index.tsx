import { createFileRoute, Link } from '@tanstack/react-router';
import { PreRegistrationForm } from '@/components/PreRegistrationForm';

export const Route = createFileRoute('/')({
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <header className="py-16 px-4 text-center">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Trade Cards
            <span className="block text-primary">In Your Neighborhood</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            TCG Trade Hub connects local Pokemon, Magic: The Gathering, and Yu-Gi-Oh! collectors
            to buy, sell, and trade cards face-to-face. No shipping. No scams. Just trades.
          </p>
          <Link
            to="/demo"
            className="mt-6 inline-block rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Try the Demo
          </Link>
        </div>
      </header>

      {/* Features */}
      <section className="mx-auto max-w-3xl px-4 pb-12">
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-5 text-center">
            <div className="text-3xl mb-2">&#128205;</div>
            <h3 className="font-semibold text-foreground">Local First</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Find collectors within walking distance. Meet at verified local game stores.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 text-center">
            <div className="text-3xl mb-2">&#9889;</div>
            <h3 className="font-semibold text-foreground">Swipe to Match</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              See cards you want, swipe right. When there's mutual interest, you match instantly.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 text-center">
            <div className="text-3xl mb-2">&#128170;</div>
            <h3 className="font-semibold text-foreground">Safe Meetups</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Trade at verified shops with ratings and reviews. Both parties confirm completion.
            </p>
          </div>
        </div>
      </section>

      {/* Registration Form */}
      <section className="mx-auto max-w-3xl px-4 pb-20">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <h2 className="mb-1 text-center text-2xl font-bold text-foreground">
            Get Early Access
          </h2>
          <p className="mb-8 text-center text-muted-foreground">
            Pre-register with a card you want to trade, buy, or sell. Your listing will be live on day one.
          </p>
          <PreRegistrationForm />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        <p>TCG Trade Hub &mdash; Coming soon to iOS and Android</p>
      </footer>
    </div>
  );
}
