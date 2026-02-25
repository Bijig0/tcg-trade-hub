import { create } from 'zustand';

type ErrorToast = {
  id: string;
  message: string;
  timestamp: number;
};

type ErrorToastState = {
  toasts: ErrorToast[];
  addToast: (message: string) => void;
  dismissToast: (id: string) => void;
};

const MAX_TOASTS = 5;
const DEDUP_WINDOW_MS = 2000;

let nextId = 0;

export const useErrorToastStore = create<ErrorToastState>()((set, get) => ({
  toasts: [],
  addToast: (message) => {
    const now = Date.now();
    const { toasts } = get();

    // Deduplicate identical messages within a short window
    const isDuplicate = toasts.some(
      (t) => t.message === message && now - t.timestamp < DEDUP_WINDOW_MS,
    );
    if (isDuplicate) return;

    const id = `toast-${nextId++}-${now}`;
    set((state) => ({
      toasts: [...state.toasts, { id, message, timestamp: now }].slice(-MAX_TOASTS),
    }));
  },
  dismissToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
}));
