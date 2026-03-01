-- =============================================================================
-- Fix missing auth.identities rows for seeded users
-- Modern GoTrue requires identity rows for password authentication
-- =============================================================================

INSERT INTO auth.identities (
  id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
)
SELECT
  u.id,
  u.id,
  jsonb_build_object(
    'sub', u.id::text,
    'email', u.email,
    'email_verified', true,
    'phone_verified', false
  ),
  'email',
  u.id::text,
  now(),
  u.created_at,
  u.updated_at
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM auth.identities i
  WHERE i.user_id = u.id AND i.provider = 'email'
);
