import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/DashboardLayout/DashboardLayout';
import { client } from '@/lib/orpc';

export const Route = createFileRoute('/_authed/dashboard')({
  component: DashboardRoute,
});

function DashboardRoute() {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['shop', 'mine'],
    queryFn: () => client.shop.get(),
  });

  useEffect(() => {
    if (!isLoading && data && !data.shop) {
      navigate({ to: '/register' });
    }
  }, [isLoading, data, navigate]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!data?.shop) {
    return null;
  }

  return (
    <DashboardLayout shopName={data.shop.name}>
      <Outlet />
    </DashboardLayout>
  );
}
