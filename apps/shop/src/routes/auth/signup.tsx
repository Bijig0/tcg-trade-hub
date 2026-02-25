import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { SignupForm } from '@/features/auth/components/SignupForm';

export const Route = createFileRoute('/auth/signup')({
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-center text-2xl font-bold text-foreground">
          Create Shop Account
        </h1>
        <SignupForm onSuccess={() => navigate({ to: '/dashboard' })} />
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <a href="/auth/login" className="text-primary hover:underline">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
