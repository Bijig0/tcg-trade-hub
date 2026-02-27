import { createFileRoute, Outlet } from '@tanstack/react-router';
import { useAuth } from '@/context/AuthContext';

const isDev = import.meta.env.DEV;

export const Route = createFileRoute('/_authed')({
  component: AuthedLayout,
});

function AuthedLayout() {
  const { user, roles, isLoading } = useAuth();

  // Bypass auth in local development
  if (isDev) {
    return <Outlet />;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login';
    }
    return null;
  }

  if (!roles.includes('admin')) {
    return <ForbiddenScreen />;
  }

  return <Outlet />;
}

const ForbiddenScreen = () => (
  <div className="flex min-h-screen items-center justify-center px-4">
    <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 text-center shadow-lg">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
        <svg
          className="h-6 w-6 text-destructive"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
          />
        </svg>
      </div>
      <h2 className="mb-2 text-xl font-semibold text-foreground">
        Access Denied
      </h2>
      <p className="mb-6 text-sm text-muted-foreground">
        You don't have admin privileges. Contact an administrator if you believe this is an error.
      </p>
      <a
        href="/auth/login"
        className="inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Sign in with a different account
      </a>
    </div>
  </div>
);
