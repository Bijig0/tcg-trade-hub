import { Link, useLocation } from '@tanstack/react-router';
import { NAV_ITEMS } from '@/config/navigation';

const ICON_MAP: Record<string, string> = {
  home: '\u{1F3E0}',
  store: '\u{1F3EA}',
  calendar: '\u{1F4C5}',
  bell: '\u{1F514}',
  cards: '\u{1F0CF}',
  tag: '\u{1F3F7}\uFE0F',
};

export const MobileNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card pb-[env(safe-area-inset-bottom)] lg:hidden">
      <ul className="flex items-center justify-around">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.href ||
            (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
          return (
            <li key={item.href}>
              <Link
                to={item.href}
                className={`flex flex-col items-center px-3 py-2 text-xs transition-colors ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <span className="text-lg">{ICON_MAP[item.icon] ?? ''}</span>
                <span className="mt-0.5">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
