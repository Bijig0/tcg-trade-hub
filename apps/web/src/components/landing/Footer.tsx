import { Link } from '@tanstack/react-router';

export const Footer = () => (
  <footer className="border-t border-border py-10">
    <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-4 sm:flex-row sm:justify-between">
      <p className="text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} TCG Trade Hub. All rights reserved.
      </p>
      <nav className="flex gap-6">
        <Link
          to="/terms"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Terms
        </Link>
        <Link
          to="/privacy"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Privacy
        </Link>
        <Link
          to="/get-started"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Get Started
        </Link>
      </nav>
    </div>
  </footer>
);
