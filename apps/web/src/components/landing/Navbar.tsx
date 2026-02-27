import { useState, useEffect } from 'react';
import { Link } from '@tanstack/react-router';

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-200 ${
        scrolled
          ? 'bg-background/80 backdrop-blur-md border-b border-border'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <a href="/" className="text-lg font-bold text-foreground">
          TCG Trade Hub
        </a>

        {/* Center links — hidden on mobile */}
        <div className="hidden items-center gap-6 md:flex">
          <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            How It Works
          </a>
          <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Features
          </a>
          <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            FAQ
          </a>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <Link
            to="/demo"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:inline"
          >
            Try Demo
          </Link>
          <a
            href="#register"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Get Early Access
          </a>
        </div>
      </div>
    </nav>
  );
};
