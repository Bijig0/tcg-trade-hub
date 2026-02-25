import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
} from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import globalsCss from '../styles/globals.css?url';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
    },
  },
});

const RootDocument = ({ children }: Readonly<{ children: ReactNode }>) => {
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
};

const RootComponent = () => {
  return (
    <RootDocument>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Outlet />
        </AuthProvider>
      </QueryClientProvider>
    </RootDocument>
  );
};

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
      { title: 'TCG Trade Hub - Shop Portal' },
      {
        name: 'description',
        content: 'Manage your local game store on TCG Trade Hub. Create events, manage your shop profile, and connect with local collectors.',
      },
      { name: 'theme-color', content: '#1a1a2e' },
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
      { name: 'supabase-url', content: process.env.SUPABASE_URL ?? '' },
      { name: 'supabase-anon-key', content: process.env.SUPABASE_ANON_KEY ?? '' },
    ],
    links: [
      { rel: 'stylesheet', href: globalsCss },
      { rel: 'manifest', href: '/manifest.json' },
      { rel: 'icon', href: '/icon-192.png', type: 'image/png' },
      { rel: 'apple-touch-icon', href: '/icon-192.png' },
    ],
  }),
  component: RootComponent,
});
