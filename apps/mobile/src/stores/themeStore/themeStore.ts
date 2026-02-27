import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { ThemeName } from '@/config/themes';

type ThemeState = {
  themeName: ThemeName;
  hasHydrated: boolean;
  setTheme: (name: ThemeName) => void;
  setHasHydrated: (hydrated: boolean) => void;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    immer((set) => ({
      themeName: 'dark-luxury' as ThemeName,
      hasHydrated: false,
      setTheme: (name) =>
        set((state) => {
          state.themeName = name;
        }),
      setHasHydrated: (hydrated) =>
        set((state) => {
          state.hasHydrated = hydrated;
        }),
    })),
    {
      name: 'tcg-theme',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ themeName: state.themeName }),
      onRehydrateStorage: () => (_state, error) => {
        if (error) {
          console.error('Theme hydration failed:', error);
        }
        useThemeStore.getState().setHasHydrated(true);
      },
    },
  ),
);
