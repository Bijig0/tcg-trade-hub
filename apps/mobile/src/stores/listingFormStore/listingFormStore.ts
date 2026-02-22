import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { TcgType, ListingType, CardCondition, NormalizedCard } from '@tcg-trade-hub/database';
import type { SelectedCard } from '@/features/listings/schemas';

type ListingFormState = {
  // Core fields
  step: number;
  type: ListingType | null;

  // Bundle fields
  selectedCards: SelectedCard[];
  tcgFilter: TcgType | null;
  cashAmount: string;
  description: string;

  // Shared actions
  setStep: (step: number) => void;
  setType: (type: ListingType) => void;
  reset: () => void;

  // Bundle card actions
  toggleSelectedCard: (card: NormalizedCard, condition: CardCondition, fromCollection: boolean) => void;
  removeSelectedCard: (externalId: string) => void;
  updateSelectedCardPrice: (externalId: string, price: string) => void;
  setAllPricesToMarket: () => void;
  setTcgFilter: (tcg: TcgType | null) => void;

  // Cash & description actions
  setCashAmount: (amount: string) => void;
  setDescription: (desc: string) => void;
};

const INITIAL_STATE = {
  step: 1,
  type: null as ListingType | null,
  selectedCards: [] as SelectedCard[],
  tcgFilter: null as TcgType | null,
  cashAmount: '0',
  description: '',
};

export const useListingFormStore = create<ListingFormState>()(
  immer((set) => ({
    ...INITIAL_STATE,

    // Shared actions
    setStep: (step) => set((s) => { s.step = step; }),
    setType: (type) => set((s) => { s.type = type; }),
    reset: () => set(() => ({ ...INITIAL_STATE })),

    // Bundle card actions
    toggleSelectedCard: (card, condition, fromCollection) =>
      set((s) => {
        const idx = s.selectedCards.findIndex((sc) => sc.card.externalId === card.externalId);
        if (idx >= 0) {
          s.selectedCards.splice(idx, 1);
        } else {
          s.selectedCards.push({
            card,
            condition,
            fromCollection,
            addToCollection: !fromCollection,
            askingPrice: '',
          });
        }
      }),

    removeSelectedCard: (externalId) =>
      set((s) => {
        const idx = s.selectedCards.findIndex((sc) => sc.card.externalId === externalId);
        if (idx >= 0) s.selectedCards.splice(idx, 1);
      }),

    updateSelectedCardPrice: (externalId, price) =>
      set((s) => {
        const card = s.selectedCards.find((sc) => sc.card.externalId === externalId);
        if (card) card.askingPrice = price;
      }),

    setAllPricesToMarket: () =>
      set((s) => {
        for (const sc of s.selectedCards) {
          if (sc.card.marketPrice != null) {
            sc.askingPrice = sc.card.marketPrice.toFixed(2);
          }
        }
      }),

    setTcgFilter: (tcg) => set((s) => { s.tcgFilter = tcg; }),

    // Cash & description actions
    setCashAmount: (amount) => set((s) => { s.cashAmount = amount; }),
    setDescription: (desc) => set((s) => { s.description = desc; }),
  })),
);
