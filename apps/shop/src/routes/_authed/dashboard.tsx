import { createFileRoute, Outlet } from '@tanstack/react-router';
import { useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/DashboardLayout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { client } from '@/lib/orpc';

export const Route = createFileRoute('/_authed/dashboard')({
  component: DashboardRoute,
});

function DashboardRoute() {
  const { roles, refreshSession } = useAuth();
  const hasAttemptedRefresh = useRef(false);

  const { data, isLoading } = useQuery({
    queryKey: ['shop', 'mine'],
    queryFn: () => client.shop.get(),
  });

  // If shop exists but shop_owner role appeared after initial sign-in, refresh JWT
  if (!isLoading && data?.shop && !roles.includes('shop_owner') && !hasAttemptedRefresh.current) {
    hasAttemptedRefresh.current = true;
    refreshSession();
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!data?.shop) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-sm text-center">
          <div className="mb-4 text-4xl">&#128736;</div>
          <h2 className="text-lg font-semibold text-foreground">
            Your shop profile is being set up
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            An admin will link your shop shortly. Contact support if this
            persists.
          </p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout shopName={data.shop.name}>
      <Outlet />
    </DashboardLayout>
  );
}
