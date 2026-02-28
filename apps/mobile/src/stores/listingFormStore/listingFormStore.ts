import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { TcgType, ListingType, CardCondition, NormalizedCard, TradeWant } from '@tcg-trade-hub/database';
import type { SelectedCard } from '@/features/listings/schemas';
import { deriveListingType } from '@/features/listings/utils/deriveListingType/deriveListingType';

type ListingFormState = {
  // Core fields
  step: number;
  type: ListingType | null;

  // Have/Want system
  acceptsCash: boolean;
  acceptsTrades: boolean;
  typeOverride: ListingType | null;

  // Bundle fields
  selectedCards: SelectedCard[];
  tcgFilter: TcgType | null;
  cashAmount: string;
  description: string;

  // Trade wants (available for all listing types now)
  tradeWants: TradeWant[];

  // Computed
  getEffectiveType: () => ListingType;

  // Shared actions
  setStep: (step: number) => void;
  setType: (type: ListingType) => void;
  reset: () => void;

  // Have/Want actions
  setAcceptsCash: (value: boolean) => void;
  setAcceptsTrades: (value: boolean) => void;
  setTypeOverride: (type: ListingType | null) => void;

  // Bundle card actions
  toggleSelectedCard: (card: NormalizedCard, condition: CardCondition, fromCollection: boolean, selectionId: string) => void;
  removeSelectedCard: (selectionId: string) => void;
  updateSelectedCardPrice: (selectionId: string, price: string) => void;
  setAllPricesToMarket: () => void;
  setTcgFilter: (tcg: TcgType | null) => void;

  // Cash & description actions
  setCashAmount: (amount: string) => void;
  setDescription: (desc: string) => void;

  // Trade wants actions
  addTradeWant: (want: TradeWant) => void;
  removeTradeWant: (index: number) => void;
};

const INITIAL_STATE = {
  step: 1,
  type: null as ListingType | null,
  acceptsCash: false,
  acceptsTrades: false,
  typeOverride: null as ListingType | null,
  selectedCards: [] as SelectedCard[],
  tcgFilter: null as TcgType | null,
  cashAmount: '0',
  description: '',
  tradeWants: [] as TradeWant[],
};

export const useListingFormStore = create<ListingFormState>()(
  immer((set, get) => ({
    ...INITIAL_STATE,

    // Computed: returns user override or auto-derived type
    getEffectiveType: () => {
      const state = get();
      if (state.typeOverride) return state.typeOverride;
      return deriveListingType({
        hasCards: state.selectedCards.length > 0,
        acceptsCash: state.acceptsCash,
        acceptsTrades: state.acceptsTrades,
      });
    },

    // Shared actions
    setStep: (step) => set((s) => { s.step = step; }),
    setType: (type) => set((s) => { s.type = type; }),
    reset: () => set(() => ({ ...INITIAL_STATE })),

    // Have/Want actions
    setAcceptsCash: (value) => set((s) => { s.acceptsCash = value; }),
    setAcceptsTrades: (value) => set((s) => { s.acceptsTrades = value; }),
    setTypeOverride: (type) => set((s) => { s.typeOverride = type; }),

    // Bundle card actions
    toggleSelectedCard: (card, condition, fromCollection, selectionId) =>
      set((s) => {
        const idx = s.selectedCards.findIndex((sc) => sc.selectionId === selectionId);
        if (idx >= 0) {
          s.selectedCards.splice(idx, 1);
        } else {
          s.selectedCards.push({
            card,
            condition,
            fromCollection,
            addToCollection: !fromCollection,
            askingPrice: '',
            selectionId,
          });
        }
      }),

    removeSelectedCard: (selectionId) =>
      set((s) => {
        const idx = s.selectedCards.findIndex((sc) => sc.selectionId === selectionId);
        if (idx >= 0) s.selectedCards.splice(idx, 1);
      }),

    updateSelectedCardPrice: (selectionId, price) =>
      set((s) => {
        const card = s.selectedCards.find((sc) => sc.selectionId === selectionId);
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

    // Trade wants actions
    addTradeWant: (want) =>
      set((s) => {
        s.tradeWants.push(want);
      }),
    removeTradeWant: (index) =>
      set((s) => {
        s.tradeWants.splice(index, 1);
      }),
  })),
);
