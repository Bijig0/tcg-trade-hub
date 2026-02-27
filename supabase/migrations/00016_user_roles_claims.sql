-- =============================================================================
-- User Roles via app_metadata Custom Claims
-- Composable roles: user, shop_owner, admin
-- =============================================================================

-- Replace entire roles array in app_metadata
CREATE OR REPLACE FUNCTION public.set_user_roles(target_user_id UUID, new_roles TEXT[])
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE auth.users
  SET raw_app_meta_data = raw_app_meta_data || jsonb_build_object('roles', to_jsonb(new_roles))
  WHERE id = target_user_id;
END;
$$;

-- Append one role (idempotent — no-op if already present)
CREATE OR REPLACE FUNCTION public.add_user_role(target_user_id UUID, role_to_add TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_roles JSONB;
BEGIN
  SELECT COALESCE(raw_app_meta_data->'roles', '[]'::jsonb)
  INTO current_roles
  FROM auth.users
  WHERE id = target_user_id;

  -- Only update if the role isn't already present
  IF NOT current_roles ? role_to_add THEN
    UPDATE auth.users
    SET raw_app_meta_data = raw_app_meta_data || jsonb_build_object('roles', current_roles || to_jsonb(role_to_add))
    WHERE id = target_user_id;
  END IF;
END;
$$;

-- Remove one role
CREATE OR REPLACE FUNCTION public.remove_user_role(target_user_id UUID, role_to_remove TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_roles JSONB;
BEGIN
  SELECT COALESCE(raw_app_meta_data->'roles', '[]'::jsonb)
  INTO current_roles
  FROM auth.users
  WHERE id = target_user_id;

  UPDATE auth.users
  SET raw_app_meta_data = raw_app_meta_data || jsonb_build_object('roles', current_roles - role_to_remove)
  WHERE id = target_user_id;
END;
$$;

-- Revoke access from public/authenticated/anon — only service_role can call these
REVOKE ALL ON FUNCTION public.set_user_roles(UUID, TEXT[]) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.add_user_role(UUID, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.remove_user_role(UUID, TEXT) FROM PUBLIC, anon, authenticated;
