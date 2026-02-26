import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

type SheetPositionState = {
  positions: Record<string, number>;
  setPosition: (key: string, index: number) => void;
  getPosition: (key: string, defaultIndex: number) => number;
};

export const useSheetPositionStore = create<SheetPositionState>()(
  persist(
    immer((set, get) => ({
      positions: {},
      setPosition: (key, index) =>
        set((state) => {
          state.positions[key] = index;
        }),
      getPosition: (key, defaultIndex) => {
        const stored = get().positions[key];
        return stored !== undefined ? stored : defaultIndex;
      },
    })),
    {
      name: 'tcg-sheet-positions',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
