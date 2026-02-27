import type { UserRole } from '@tcg-trade-hub/database';
import type { Context } from '../../context';
import { requireAuth } from '../requireAuth';

/**
 * Ensures the request has an authenticated user with the specified role.
 * Calls requireAuth() first, then checks for the role in context.roles.
 */
export const requireRole = (
  context: Context,
  role: UserRole,
): Context & { userId: string; roles: UserRole[] } => {
  const authed = requireAuth(context);
  const roles = authed.roles ?? [];

  if (!roles.includes(role)) {
    throw new Error(`Forbidden: requires ${role} role`);
  }

  return { ...authed, roles };
};
