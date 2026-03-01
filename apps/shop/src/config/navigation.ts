export type NavItem = {
  label: string;
  href: string;
  icon: string;
};

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: 'home' },
  { label: 'Collection', href: '/dashboard/collection', icon: 'cards' },
  { label: 'Listings', href: '/dashboard/listings', icon: 'tag' },
  { label: 'Profile', href: '/dashboard/profile', icon: 'store' },
  { label: 'Events', href: '/dashboard/events', icon: 'calendar' },
  { label: 'Notifications', href: '/dashboard/notifications', icon: 'bell' },
];
