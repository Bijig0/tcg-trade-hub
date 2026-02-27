import React, { createContext, useContext, useMemo } from 'react';
import { View, StatusBar } from 'react-native';
import { vars } from 'react-native-css-interop';
import { THEME, THEMES, type ThemeName } from '@/config/themes';
import { useThemeStore } from '@/stores/themeStore/themeStore';

type ThemeContextValue = {
  themeName: ThemeName;
  isDark: boolean;
  tabBar: {
    activeTintColor: string;
    inactiveTintColor: string;
    backgroundColor: string;
  };
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const ThemeProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const themeName = useThemeStore((s) => s.themeName);
  const hasHydrated = useThemeStore((s) => s.hasHydrated);
  const theme = THEMES[themeName] ?? THEME;

  if (!hasHydrated) {
    return null;
  }

  const themeStyle = useMemo(() => vars(theme.vars), [themeName]);

  const contextValue = useMemo<ThemeContextValue>(
    () => ({
      themeName,
      isDark: theme.meta.isDark,
      tabBar: theme.meta.tabBar,
    }),
    [themeName],
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      <View style={[{ flex: 1 }, themeStyle]}>
        <StatusBar barStyle={theme.meta.isDark ? 'light-content' : 'dark-content'} />
        {children}
      </View>
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
