import { create } from './procedures/preRegistration';
import { search } from './procedures/cardSearch';

export const router = {
  preRegistration: { create },
  card: { search },
};

export type Router = typeof router;
