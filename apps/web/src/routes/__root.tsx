import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
} from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import globalsCss from '../styles/globals.css?url';

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

function RootComponent() {
  return (
    <RootDocument>
      <QueryClientProvider client={queryClient}>
        <Outlet />
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
    ],
    links: [{ rel: 'stylesheet', href: globalsCss }],
  }),
  component: RootComponent,
});
