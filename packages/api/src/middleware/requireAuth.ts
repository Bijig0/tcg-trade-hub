import type { Context } from '../context';

/**
 * Ensures the request has an authenticated userId in context.
 * Throws if missing.
 */
export const requireAuth = (context: Context): Context & { userId: string } => {
  if (!context.userId) {
    throw new Error('Authentication required');
  }
  return context as Context & { userId: string };
};
