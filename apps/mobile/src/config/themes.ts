/** Theme name union type */
export type ThemeName = 'modern-collector' | 'marketplace-fresh' | 'dark-luxury';

type ThemeMeta = {
  label: string;
  isDark: boolean;
  /** Hex colors for the settings UI swatch preview */
  previewColors: {
    background: string;
    primary: string;
    accent: string;
  };
  /** Hex colors for React Navigation tab bar (can't use NativeWind classNames) */
  tabBar: {
    activeTintColor: string;
    inactiveTintColor: string;
    backgroundColor: string;
  };
};

type ThemeDefinition = {
  vars: Record<string, string>;
  meta: ThemeMeta;
};

const MODERN_COLLECTOR: ThemeDefinition = {
  vars: {
    '--background': '250 15% 97%',
    '--foreground': '240 15% 10%',
    '--card': '0 0% 100%',
    '--card-foreground': '240 15% 10%',
    '--primary': '262 83% 58%',
    '--primary-foreground': '0 0% 100%',
    '--secondary': '260 50% 95%',
    '--secondary-foreground': '262 60% 35%',
    '--muted': '250 12% 94%',
    '--muted-foreground': '240 5% 46%',
    '--accent': '280 70% 60%',
    '--accent-foreground': '0 0% 100%',
    '--destructive': '0 84% 60%',
    '--destructive-foreground': '0 0% 98%',
    '--border': '260 20% 90%',
    '--input': '260 20% 90%',
    '--ring': '262 83% 58%',
  },
  meta: {
    label: 'Modern Collector',
    isDark: false,
    previewColors: {
      background: '#f5f4f9',
      primary: '#7c3aed',
      accent: '#a855f7',
    },
    tabBar: {
      activeTintColor: '#7c3aed',
      inactiveTintColor: '#9ca3af',
      backgroundColor: '#f5f4f9',
    },
  },
};

const MARKETPLACE_FRESH: ThemeDefinition = {
  vars: {
    '--background': '160 15% 97%',
    '--foreground': '180 15% 10%',
    '--card': '0 0% 100%',
    '--card-foreground': '180 15% 10%',
    '--primary': '172 66% 38%',
    '--primary-foreground': '0 0% 100%',
    '--secondary': '165 40% 94%',
    '--secondary-foreground': '172 50% 25%',
    '--muted': '160 10% 94%',
    '--muted-foreground': '160 5% 46%',
    '--accent': '158 64% 42%',
    '--accent-foreground': '0 0% 100%',
    '--destructive': '0 84% 60%',
    '--destructive-foreground': '0 0% 98%',
    '--border': '165 15% 88%',
    '--input': '165 15% 88%',
    '--ring': '172 66% 38%',
  },
  meta: {
    label: 'Marketplace Fresh',
    isDark: false,
    previewColors: {
      background: '#f3f9f7',
      primary: '#0d9488',
      accent: '#10b981',
    },
    tabBar: {
      activeTintColor: '#0d9488',
      inactiveTintColor: '#9ca3af',
      backgroundColor: '#f3f9f7',
    },
  },
};

const DARK_LUXURY: ThemeDefinition = {
  vars: {
    '--background': '228 20% 7%',
    '--foreground': '210 20% 93%',
    '--card': '228 18% 12%',
    '--card-foreground': '210 20% 93%',
    '--primary': '192 91% 54%',
    '--primary-foreground': '228 25% 7%',
    '--secondary': '228 15% 17%',
    '--secondary-foreground': '210 15% 80%',
    '--muted': '228 15% 14%',
    '--muted-foreground': '215 10% 55%',
    '--accent': '199 89% 48%',
    '--accent-foreground': '0 0% 100%',
    '--destructive': '0 72% 51%',
    '--destructive-foreground': '0 0% 98%',
    '--border': '228 15% 20%',
    '--input': '228 15% 20%',
    '--ring': '192 91% 54%',
  },
  meta: {
    label: 'Dark Luxury',
    isDark: true,
    previewColors: {
      background: '#0f1219',
      primary: '#22d3ee',
      accent: '#0ea5e9',
    },
    tabBar: {
      activeTintColor: '#22d3ee',
      inactiveTintColor: '#6b7280',
      backgroundColor: '#0f1219',
    },
  },
};

export const THEMES: Record<ThemeName, ThemeDefinition> = {
  'modern-collector': MODERN_COLLECTOR,
  'marketplace-fresh': MARKETPLACE_FRESH,
  'dark-luxury': DARK_LUXURY,
} as const;

export const THEME_LIST: { name: ThemeName; meta: ThemeMeta }[] = [
  { name: 'modern-collector', meta: MODERN_COLLECTOR.meta },
  { name: 'marketplace-fresh', meta: MARKETPLACE_FRESH.meta },
  { name: 'dark-luxury', meta: DARK_LUXURY.meta },
];
