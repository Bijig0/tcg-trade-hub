/** Single theme — Dark Luxury */
export type ThemeName = 'dark-luxury';

type ThemeMeta = {
  label: string;
  isDark: boolean;
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
    '--accent': '228 15% 17%',
    '--accent-foreground': '210 15% 80%',
    '--destructive': '0 72% 51%',
    '--destructive-foreground': '0 0% 98%',
    '--border': '228 15% 20%',
    '--input': '228 15% 20%',
    '--ring': '192 91% 54%',
  },
  meta: {
    label: 'Dark Luxury',
    isDark: true,
    tabBar: {
      activeTintColor: '#22d3ee',
      inactiveTintColor: '#6b7280',
      backgroundColor: '#0f1219',
    },
  },
};

export const THEME = DARK_LUXURY;

export const THEMES: Record<ThemeName, ThemeDefinition> = {
  'dark-luxury': DARK_LUXURY,
} as const;
