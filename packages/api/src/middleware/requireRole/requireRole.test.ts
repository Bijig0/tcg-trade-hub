import { describe, it, expect } from 'vitest';
import { requireRole } from './requireRole';
import type { Context } from '../../context';

const makeContext = (overrides: Partial<Context> = {}): Context => ({
  supabase: {} as Context['supabase'],
  ...overrides,
});

describe('requireRole', () => {
  it('should throw if userId is missing', () => {
    const ctx = makeContext({ roles: ['user'] });
    expect(() => requireRole(ctx, 'user')).toThrow('Authentication required');
  });

  it('should throw if roles are missing', () => {
    const ctx = makeContext({ userId: 'abc' });
    expect(() => requireRole(ctx, 'admin')).toThrow('Forbidden: requires admin role');
  });

  it('should throw if roles array is empty', () => {
    const ctx = makeContext({ userId: 'abc', roles: [] });
    expect(() => requireRole(ctx, 'shop_owner')).toThrow('Forbidden: requires shop_owner role');
  });

  it('should throw if the required role is not in roles', () => {
    const ctx = makeContext({ userId: 'abc', roles: ['user'] });
    expect(() => requireRole(ctx, 'admin')).toThrow('Forbidden: requires admin role');
  });

  it('should return context with userId and roles when role is present', () => {
    const ctx = makeContext({ userId: 'abc', roles: ['user', 'admin'] });
    const result = requireRole(ctx, 'admin');
    expect(result.userId).toBe('abc');
    expect(result.roles).toEqual(['user', 'admin']);
  });

  it('should work with shop_owner role', () => {
    const ctx = makeContext({ userId: 'abc', roles: ['user', 'shop_owner'] });
    const result = requireRole(ctx, 'shop_owner');
    expect(result.userId).toBe('abc');
    expect(result.roles).toContain('shop_owner');
  });
});
