import { createFileRoute, Link } from '@tanstack/react-router';
import { DemoChat } from '@/components/demo/DemoChat';
import { SITE_URL, DEFAULT_OG_IMAGE } from '@/components/seo/seoConstants';

export const Route = createFileRoute('/get-started')({
  head: () => ({
    meta: [
      { title: 'Get Started - TCG Trade Hub' },
      {
        name: 'description',
        content:
          'Start trading cards locally in minutes. Chat with a collector, build a trade offer, and sign up for early access.',
      },
      { property: 'og:title', content: 'Get Started - TCG Trade Hub' },
      {
        property: 'og:description',
        content:
          'Start trading cards locally in minutes. Chat with a collector, build a trade offer, and sign up for early access.',
      },
      { property: 'og:image', content: `${SITE_URL}${DEFAULT_OG_IMAGE}` },
    ],
  }),
  component: GetStartedPage,
});

function GetStartedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <div className="mb-6 text-center">
        <Link
          to="/"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          &larr; Back to home
        </Link>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          See how trading works
        </h1>
        <p className="mt-2 text-muted-foreground">
          Chat with a collector, build a counter-offer, and sign up for early access.
        </p>
      </div>
      <DemoChat />
    </div>
  );
}
