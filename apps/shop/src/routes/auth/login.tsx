import { createFileRoute, Navigate, useNavigate } from '@tanstack/react-router';
import { z } from 'zod';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { useAuth } from '@/context/AuthContext';

const loginSearchSchema = z.object({
  error: z.enum(['unauthorized']).optional(),
});

export const Route = createFileRoute('/auth/login')({
  component: LoginPage,
  validateSearch: loginSearchSchema,
});

function LoginPage() {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const { error } = Route.useSearch();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-center text-2xl font-bold text-foreground">
          Sign in to Shop Portal
        </h1>
        {error === 'unauthorized' && (
          <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-center text-sm text-destructive">
            This portal is for verified shop owners only. Contact us to register
            your store.
          </div>
        )}
        <LoginForm onSuccess={() => navigate({ to: '/dashboard' })} />
      </div>
    </div>
  );
}
