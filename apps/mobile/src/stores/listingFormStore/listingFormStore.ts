import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { TcgType, ListingType, CardCondition, NormalizedCard } from '@tcg-trade-hub/database';
import type { SelectedCard, WantedCard } from '@/features/listings/schemas';

type ListingFormState = {
  // Shared
  step: number;
  type: ListingType | null;

  // WTB single-card fields (unchanged)
  tcg: TcgType | null;
  card: NormalizedCard | null;
  condition: CardCondition | null;
  askingPrice: string;
  photos: string[];
  description: string;
  addToCollection: boolean;
  cardFromCollection: boolean;

  // WTS/WTT multi-card fields
  selectedCards: SelectedCard[];
  wantedCards: WantedCard[];
  tcgFilter: TcgType | null;

  // Shared actions
  setStep: (step: number) => void;
  setType: (type: ListingType) => void;
  reset: () => void;

  // WTB actions (unchanged)
  setTcg: (tcg: TcgType) => void;
  setCard: (card: NormalizedCard) => void;
  setCondition: (condition: CardCondition) => void;
  setAskingPrice: (price: string) => void;
  addPhoto: (uri: string) => void;
  removePhoto: (index: number) => void;
  setDescription: (desc: string) => void;
  setAddToCollection: (val: boolean) => void;
  setCardFromCollection: (val: boolean) => void;

  // WTS/WTT multi-card actions
  toggleSelectedCard: (card: NormalizedCard, condition: CardCondition, fromCollection: boolean) => void;
  removeSelectedCard: (externalId: string) => void;
  updateSelectedCardPrice: (externalId: string, price: string) => void;
  setAllPricesToMarket: () => void;
  addWantedCard: (card: NormalizedCard) => void;
  removeWantedCard: (externalId: string) => void;
  setTcgFilter: (tcg: TcgType | null) => void;
};

const INITIAL_STATE = {
  step: 1,
  type: null as ListingType | null,
  tcg: null as TcgType | null,
  card: null as NormalizedCard | null,
  condition: null as CardCondition | null,
  askingPrice: '',
  photos: [] as string[],
  description: '',
  addToCollection: true,
  cardFromCollection: false,
  selectedCards: [] as SelectedCard[],
  wantedCards: [] as WantedCard[],
  tcgFilter: null as TcgType | null,
};

export const useListingFormStore = create<ListingFormState>()(
  immer((set) => ({
    ...INITIAL_STATE,

    // Shared actions
    setStep: (step) => set((s) => { s.step = step; }),
    setType: (type) => set((s) => { s.type = type; }),
    reset: () => set(() => ({ ...INITIAL_STATE })),

    // WTB actions
    setTcg: (tcg) => set((s) => { s.tcg = tcg; }),
    setCard: (card) => set((s) => { s.card = card; }),
    setCondition: (condition) => set((s) => { s.condition = condition; }),
    setAskingPrice: (price) => set((s) => { s.askingPrice = price; }),
    addPhoto: (uri) => set((s) => { s.photos.push(uri); }),
    removePhoto: (index) => set((s) => { s.photos.splice(index, 1); }),
    setDescription: (desc) => set((s) => { s.description = desc; }),
    setAddToCollection: (val) => set((s) => { s.addToCollection = val; }),
    setCardFromCollection: (val) => set((s) => { s.cardFromCollection = val; }),

    // WTS/WTT multi-card actions
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

    addWantedCard: (card) =>
      set((s) => {
        const exists = s.wantedCards.some((wc) => wc.card.externalId === card.externalId);
        if (!exists) {
          s.wantedCards.push({ card });
        }
      }),

    removeWantedCard: (externalId) =>
      set((s) => {
        const idx = s.wantedCards.findIndex((wc) => wc.card.externalId === externalId);
        if (idx >= 0) s.wantedCards.splice(idx, 1);
      }),

    setTcgFilter: (tcg) => set((s) => { s.tcgFilter = tcg; }),
  })),
);
