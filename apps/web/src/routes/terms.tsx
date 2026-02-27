import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/terms')({
  head: () => ({
    meta: [
      { title: 'Terms of Service - TCG Trade Hub' },
      {
        name: 'description',
        content: 'Terms of Service for TCG Trade Hub.',
      },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <Link
        to="/"
        className="mb-8 inline-block text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        &larr; Back to home
      </Link>
      <h1 className="mb-6 text-3xl font-bold text-foreground">
        Terms of Service
      </h1>
      <div className="space-y-4 text-sm text-muted-foreground">
        <p>
          <strong className="text-foreground">Last updated:</strong> February 2026
        </p>
        <p>
          These Terms of Service govern your use of the TCG Trade Hub application and website. By accessing or using TCG Trade Hub, you agree to be bound by these terms.
        </p>
        <h2 className="pt-4 text-lg font-semibold text-foreground">
          1. Acceptance of Terms
        </h2>
        <p>
          By creating an account or using TCG Trade Hub, you agree to these Terms of Service and our Privacy Policy. If you do not agree, do not use the service.
        </p>
        <h2 className="pt-4 text-lg font-semibold text-foreground">
          2. Description of Service
        </h2>
        <p>
          TCG Trade Hub is a platform that connects local trading card game collectors to buy, sell, and trade cards face-to-face. We facilitate connections between users but are not a party to any transactions.
        </p>
        <h2 className="pt-4 text-lg font-semibold text-foreground">
          3. User Responsibilities
        </h2>
        <p>
          You are responsible for the accuracy of your listings, your conduct during meetups, and complying with all applicable laws regarding the sale and trade of goods.
        </p>
        <h2 className="pt-4 text-lg font-semibold text-foreground">
          4. Limitation of Liability
        </h2>
        <p>
          TCG Trade Hub is provided "as is" without warranties. We are not responsible for the outcome of any trades, meetups, or interactions between users.
        </p>
        <h2 className="pt-4 text-lg font-semibold text-foreground">
          5. Contact
        </h2>
        <p>
          For questions about these terms, contact us at terms@tcgtradehub.com.
        </p>
        <p className="pt-8 text-xs text-muted-foreground/60">
          This is a placeholder. Full terms will be published before launch.
        </p>
      </div>
    </div>
  );
}
