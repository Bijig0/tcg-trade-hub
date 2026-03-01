import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="mx-auto max-w-md text-center">
        <div className="mb-6 text-5xl">&#127983;</div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          TCG Trade Hub
          <span className="block text-primary">Shop Portal</span>
        </h1>
        <p className="mt-4 text-muted-foreground">
          Manage your local game store, create events, and connect with
          collectors in your area.
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <Link
            to="/auth/login"
            className="rounded-lg bg-primary px-6 py-3 text-center font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
