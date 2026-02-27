import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
} from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import globalsCss from '../styles/globals.css?url';
import { JsonLd } from '@/components/seo/JsonLd';
import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE } from '@/components/seo/seoConstants';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
    },
  },
});

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  description:
    'Local trading card game marketplace for Pokemon, Magic: The Gathering, and Yu-Gi-Oh collectors.',
};

function RootComponent() {
  return (
    <RootDocument>
      <QueryClientProvider client={queryClient}>
        <Outlet />
        <JsonLd data={organizationJsonLd} />
      </QueryClientProvider>
    </RootDocument>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'TCG Trade Hub - Trade Cards Locally' },
      {
        name: 'description',
        content:
          'Find local trading card game collectors to buy, sell, and trade Pokemon, MTG, and Yu-Gi-Oh cards. Pre-register now for early access.',
      },
      { property: 'og:title', content: 'TCG Trade Hub - Trade Cards Locally' },
      {
        property: 'og:description',
        content:
          'Find local trading card game collectors to buy, sell, and trade Pokemon, MTG, and Yu-Gi-Oh cards.',
      },
      { property: 'og:type', content: 'website' },
      { property: 'og:image', content: `${SITE_URL}${DEFAULT_OG_IMAGE}` },
      { property: 'og:site_name', content: SITE_NAME },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'TCG Trade Hub - Trade Cards Locally' },
      {
        name: 'twitter:description',
        content:
          'Find local trading card game collectors to buy, sell, and trade Pokemon, MTG, and Yu-Gi-Oh cards.',
      },
      { name: 'twitter:image', content: `${SITE_URL}${DEFAULT_OG_IMAGE}` },
      { name: 'theme-color', content: '#4f46e5' },
    ],
    links: [
      { rel: 'stylesheet', href: globalsCss },
      { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
    ],
  }),
  component: RootComponent,
});
