-- Enforce role status everywhere and make admin management super-admin-only,
-- matching the Admins page ("only Super Admins can add, remove or suspend admins").
--
-- * has_role() only counts active roles, so a suspended admin loses every
--   admin permission (all RLS policies and RPCs authorize through has_role or
--   is_super_admin, which already required status = 'active'). An active
--   super_admin also satisfies has_role(..., 'admin'), so super admins without
--   a separate admin row can use the admin area.
-- * invite_admin, revoke_admin and assign_role require an active super admin.
--   The first super admin is created with bootstrap_super_admin() (service role).
-- * revoke_admin / remove_role can no longer remove the last active admin /
--   super admin.

-- 1. has_role: active roles only; super_admin implies admin ------------------
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND status = 'active'
      AND (role = _role
           OR (_role = 'admin'::public.app_role AND role = 'super_admin'::public.app_role))
  )
$$;

REVOKE ALL ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated, service_role;

-- 2. invite_admin: super admin only -------------------------------------------
CREATE OR REPLACE FUNCTION public.invite_admin(_email TEXT)
RETURNS public.admin_invitations LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _actor UUID := auth.uid(); _actor_email TEXT; _inv public.admin_invitations;
BEGIN
  IF _actor IS NULL OR NOT public.is_super_admin(_actor) THEN RAISE EXCEPTION 'forbidden: super admin only'; END IF;
  IF _email IS NULL OR _email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN RAISE EXCEPTION 'invalid email'; END IF;
  SELECT email INTO _actor_email FROM auth.users WHERE id = _actor;
  INSERT INTO public.admin_invitations (email, invited_by, role)
    VALUES (lower(_email), _actor, 'admin') RETURNING * INTO _inv;
  INSERT INTO public.admin_audit_log (actor_id, actor_email, action, target_email, metadata)
    VALUES (_actor, _actor_email, 'invite_admin', lower(_email), jsonb_build_object('invitation_id', _inv.id));
  RETURN _inv;
END; $$;

REVOKE ALL ON FUNCTION public.invite_admin(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.invite_admin(TEXT) TO authenticated, service_role;

-- 3. revoke_admin: super admin only, never the last active admin ------------
CREATE OR REPLACE FUNCTION public.revoke_admin(_user_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _actor UUID := auth.uid(); _actor_email TEXT; _target_email TEXT;
BEGIN
  IF _actor IS NULL OR NOT public.is_super_admin(_actor) THEN RAISE EXCEPTION 'forbidden: super admin only'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.user_roles
                 WHERE user_id <> _user_id AND status = 'active'
                   AND role IN ('admin'::public.app_role, 'super_admin'::public.app_role)) THEN
    RAISE EXCEPTION 'cannot revoke the last admin';
  END IF;
  SELECT email INTO _actor_email FROM auth.users WHERE id = _actor;
  SELECT email INTO _target_email FROM auth.users WHERE id = _user_id;
  DELETE FROM public.user_roles WHERE user_id = _user_id AND role = 'admin';
  INSERT INTO public.admin_audit_log (actor_id, actor_email, action, target_email, target_user_id)
    VALUES (_actor, _actor_email, 'revoke_admin', _target_email, _user_id);
END; $$;

REVOKE ALL ON FUNCTION public.revoke_admin(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.revoke_admin(UUID) TO authenticated, service_role;

-- 4. assign_role: super admin only (no admin bootstrap path) ------------------
CREATE OR REPLACE FUNCTION public.assign_role(_email TEXT, _role public.app_role)
RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _actor UUID := auth.uid(); _actor_email TEXT; _target UUID; _inv_id UUID;
BEGIN
  IF _actor IS NULL OR NOT public.is_super_admin(_actor) THEN RAISE EXCEPTION 'forbidden: super admin only'; END IF;
  IF _email IS NULL OR _email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN RAISE EXCEPTION 'invalid email'; END IF;

  SELECT email INTO _actor_email FROM auth.users WHERE id = _actor;
  SELECT id INTO _target FROM auth.users WHERE lower(email) = lower(_email) LIMIT 1;

  IF _target IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (_target, _role)
      ON CONFLICT (user_id, role) DO UPDATE SET status = 'active', updated_at = now();
    INSERT INTO public.admin_audit_log (actor_id, actor_email, action, target_email, target_user_id, metadata)
      VALUES (_actor, _actor_email, 'assign_role', lower(_email), _target, jsonb_build_object('role', _role));
    RETURN 'assigned';
  END IF;

  INSERT INTO public.admin_invitations (email, invited_by, role)
    VALUES (lower(_email), _actor, _role) RETURNING id INTO _inv_id;
  INSERT INTO public.admin_audit_log (actor_id, actor_email, action, target_email, metadata)
    VALUES (_actor, _actor_email, 'invite_role', lower(_email), jsonb_build_object('role', _role, 'invitation_id', _inv_id));
  RETURN 'invited';
END; $$;

REVOKE ALL ON FUNCTION public.assign_role(TEXT, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.assign_role(TEXT, public.app_role) TO authenticated, service_role;

-- 5. remove_role: never remove the last active super admin -------------------
CREATE OR REPLACE FUNCTION public.remove_role(_user_id UUID, _role public.app_role)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _actor UUID := auth.uid(); _actor_email TEXT; _target_email TEXT;
BEGIN
  IF _actor IS NULL OR NOT public.is_super_admin(_actor) THEN RAISE EXCEPTION 'forbidden: super admin only'; END IF;
  IF _role = 'super_admin'::public.app_role AND NOT EXISTS (
       SELECT 1 FROM public.user_roles
       WHERE role = 'super_admin'::public.app_role AND status = 'active' AND user_id <> _user_id) THEN
    RAISE EXCEPTION 'cannot remove the last super admin';
  END IF;
  SELECT email INTO _actor_email FROM auth.users WHERE id = _actor;
  SELECT email INTO _target_email FROM auth.users WHERE id = _user_id;
  DELETE FROM public.user_roles WHERE user_id = _user_id AND role = _role;
  INSERT INTO public.admin_audit_log (actor_id, actor_email, action, target_email, target_user_id, metadata)
    VALUES (_actor, _actor_email, 'remove_role', _target_email, _user_id, jsonb_build_object('role', _role));
END; $$;

REVOKE ALL ON FUNCTION public.remove_role(UUID, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.remove_role(UUID, public.app_role) TO authenticated, service_role;
