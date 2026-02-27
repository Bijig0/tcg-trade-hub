import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/privacy')({
  head: () => ({
    meta: [
      { title: 'Privacy Policy - TCG Trade Hub' },
      {
        name: 'description',
        content: 'Privacy Policy for TCG Trade Hub.',
      },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <Link
        to="/"
        className="mb-8 inline-block text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        &larr; Back to home
      </Link>
      <h1 className="mb-6 text-3xl font-bold text-foreground">
        Privacy Policy
      </h1>
      <div className="space-y-4 text-sm text-muted-foreground">
        <p>
          <strong className="text-foreground">Last updated:</strong> February 2026
        </p>
        <p>
          This Privacy Policy describes how TCG Trade Hub collects, uses, and protects your information when you use our application and website.
        </p>
        <h2 className="pt-4 text-lg font-semibold text-foreground">
          1. Information We Collect
        </h2>
        <p>
          We collect information you provide directly, such as your email address, display name, city, and card listing preferences when you pre-register or create an account.
        </p>
        <h2 className="pt-4 text-lg font-semibold text-foreground">
          2. How We Use Your Information
        </h2>
        <p>
          We use your information to provide and improve our services, match you with nearby collectors, facilitate trades, and send you launch notifications if you pre-register.
        </p>
        <h2 className="pt-4 text-lg font-semibold text-foreground">
          3. Location Data
        </h2>
        <p>
          TCG Trade Hub uses location data to show you nearby listings and suggest local meetup locations. Location data is used only for the core service and is not shared with third parties.
        </p>
        <h2 className="pt-4 text-lg font-semibold text-foreground">
          4. Data Security
        </h2>
        <p>
          We use industry-standard security measures to protect your data, including encryption in transit and at rest. Your data is stored securely on our cloud infrastructure.
        </p>
        <h2 className="pt-4 text-lg font-semibold text-foreground">
          5. Contact
        </h2>
        <p>
          For questions about this privacy policy, contact us at privacy@tcgtradehub.com.
        </p>
        <p className="pt-8 text-xs text-muted-foreground/60">
          This is a placeholder. Full privacy policy will be published before launch.
        </p>
      </div>
    </div>
  );
}
