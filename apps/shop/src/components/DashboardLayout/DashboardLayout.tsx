import { Link, useLocation } from '@tanstack/react-router';
import { useAuth } from '@/context/AuthContext';
import { NAV_ITEMS } from '@/config/navigation';
import { MobileNav } from '@/components/MobileNav/MobileNav';
import { NotificationBell } from '@/components/NotificationBell/NotificationBell';
import type { PropsWithChildren } from 'react';

type DashboardLayoutProps = PropsWithChildren<{
  shopName: string;
}>;

const ICON_MAP: Record<string, string> = {
  home: '\u{1F3E0}',
  store: '\u{1F3EA}',
  calendar: '\u{1F4C5}',
  bell: '\u{1F514}',
};

export const DashboardLayout = ({ children, shopName }: DashboardLayoutProps) => {
  const { signOut } = useAuth();
  const location = useLocation();

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Sidebar — desktop only */}
      <aside className="hidden w-64 shrink-0 border-r border-border bg-card lg:flex lg:flex-col">
        <div className="border-b border-border p-4">
          <div className="text-sm text-muted-foreground">Shop Portal</div>
          <div className="mt-0.5 truncate font-semibold text-foreground">
            {shopName}
          </div>
        </div>
        <nav className="flex-1 p-3">
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.href ||
                (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    }`}
                  >
                    <span>{ICON_MAP[item.icon] ?? ''}</span>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="border-t border-border p-3">
          <button
            type="button"
            onClick={signOut}
            className="w-full rounded-lg px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex flex-1 flex-col">
        {/* Top bar — mobile */}
        <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3 lg:hidden">
          <div className="font-semibold text-foreground">{shopName}</div>
          <NotificationBell />
        </header>

        {/* Top bar — desktop */}
        <header className="hidden items-center justify-end border-b border-border bg-card px-6 py-3 lg:flex">
          <NotificationBell />
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 pb-20 lg:p-6 lg:pb-6">
          {children}
        </main>

        {/* Bottom nav — mobile only */}
        <MobileNav />
      </div>
    </div>
  );
};
