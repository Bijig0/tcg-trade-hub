import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { TcgType, ListingType, CardCondition, NormalizedCard } from '@tcg-trade-hub/database';

type ListingFormState = {
  step: number;
  type: ListingType | null;
  tcg: TcgType | null;
  card: NormalizedCard | null;
  condition: CardCondition | null;
  askingPrice: string;
  photos: string[];
  description: string;
  addToCollection: boolean;
  cardFromCollection: boolean;
  setStep: (step: number) => void;
  setType: (type: ListingType) => void;
  setTcg: (tcg: TcgType) => void;
  setCard: (card: NormalizedCard) => void;
  setCondition: (condition: CardCondition) => void;
  setAskingPrice: (price: string) => void;
  addPhoto: (uri: string) => void;
  removePhoto: (index: number) => void;
  setDescription: (desc: string) => void;
  setAddToCollection: (val: boolean) => void;
  setCardFromCollection: (val: boolean) => void;
  reset: () => void;
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
};

export const useListingFormStore = create<ListingFormState>()(
  immer((set) => ({
    ...INITIAL_STATE,
    setStep: (step) => set((s) => { s.step = step; }),
    setType: (type) => set((s) => { s.type = type; }),
    setTcg: (tcg) => set((s) => { s.tcg = tcg; }),
    setCard: (card) => set((s) => { s.card = card; }),
    setCondition: (condition) => set((s) => { s.condition = condition; }),
    setAskingPrice: (price) => set((s) => { s.askingPrice = price; }),
    addPhoto: (uri) => set((s) => { s.photos.push(uri); }),
    removePhoto: (index) => set((s) => { s.photos.splice(index, 1); }),
    setDescription: (desc) => set((s) => { s.description = desc; }),
    setAddToCollection: (val) => set((s) => { s.addToCollection = val; }),
    setCardFromCollection: (val) => set((s) => { s.cardFromCollection = val; }),
    reset: () => set(() => ({ ...INITIAL_STATE })),
  })),
);
