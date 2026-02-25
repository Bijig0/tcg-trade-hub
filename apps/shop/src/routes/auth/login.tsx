import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { LoginForm } from '@/features/auth/components/LoginForm';

export const Route = createFileRoute('/auth/login')({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-center text-2xl font-bold text-foreground">
          Sign in to Shop Portal
        </h1>
        <LoginForm onSuccess={() => navigate({ to: '/dashboard' })} />
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <a href="/auth/signup" className="text-primary hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
