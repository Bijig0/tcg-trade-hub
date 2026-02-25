import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { ShopRegistrationForm } from '@/features/shop-profile/components/ShopRegistrationForm';

export const Route = createFileRoute('/_authed/register')({
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <h1 className="mb-2 text-center text-2xl font-bold text-foreground">
          Register Your Shop
        </h1>
        <p className="mb-8 text-center text-muted-foreground">
          Set up your local game store on TCG Trade Hub so collectors can find
          you.
        </p>
        <ShopRegistrationForm
          onSuccess={() => navigate({ to: '/dashboard' })}
        />
      </div>
    </div>
  );
}
