/**
 * Test user accounts available in dev mode.
 * Shared between DevUserSwitcher and DevChatActions.
 */
export const DEV_USERS = [
  { email: 'alice@test.dev', password: 'testtest123', name: 'Alice' },
  { email: 'bob@test.dev', password: 'testtest123', name: 'Bob' },
  { email: 'charlie@test.dev', password: 'testtest123', name: 'Charlie' },
] as const;
