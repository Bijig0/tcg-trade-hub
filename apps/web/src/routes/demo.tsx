import { createFileRoute, Link } from '@tanstack/react-router';
import { DemoChat } from '@/components/demo/DemoChat';
import { SITE_URL, DEFAULT_OG_IMAGE } from '@/components/seo/seoConstants';

export const Route = createFileRoute('/demo')({
  head: () => ({
    meta: [
      { title: 'Try the Demo - TCG Trade Hub' },
      {
        name: 'description',
        content:
          "Experience TCG Trade Hub's chat and trade offer system. Build a counter-offer and see how local card trading works.",
      },
      { property: 'og:title', content: 'Try the Demo - TCG Trade Hub' },
      {
        property: 'og:description',
        content:
          "Experience TCG Trade Hub's chat and trade offer system. Build a counter-offer and see how local card trading works.",
      },
      { property: 'og:image', content: `${SITE_URL}${DEFAULT_OG_IMAGE}` },
    ],
  }),
  component: DemoPage,
});

function DemoPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <div className="mb-4">
        <Link
          to="/"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          &larr; Back to home
        </Link>
      </div>
      <DemoChat />
    </div>
  );
}
