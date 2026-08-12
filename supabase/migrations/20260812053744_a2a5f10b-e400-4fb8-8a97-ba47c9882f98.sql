-- 2. user_roles: status + updated_at
ALTER TABLE public.user_roles
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

DO $$ BEGIN
  ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_status_chk CHECK (status IN ('active','suspended'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3. profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  user_id UUID PRIMARY KEY,
  email TEXT,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "own profile read" ON public.profiles;
CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "own profile write" ON public.profiles;
CREATE POLICY "own profile write" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "own profile update" ON public.profiles;
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP TRIGGER IF EXISTS profiles_touch ON public.profiles;
CREATE TRIGGER profiles_touch BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- 4. invitations carry a role
ALTER TABLE public.admin_invitations
  ADD COLUMN IF NOT EXISTS role public.app_role NOT NULL DEFAULT 'admin';

-- 5. helper: any elevated role
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id UUID)
RETURNS BOOLEAN LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE ok BOOLEAN;
BEGIN
  SELECT EXISTS (SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'super_admin'::public.app_role AND status = 'active')
  INTO ok;
  RETURN ok;
END; $$;

REVOKE EXECUTE ON FUNCTION public.is_super_admin(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_super_admin(UUID) TO authenticated;

-- 6. sign-in hook: record profile + auto-claim invited roles
CREATE OR REPLACE FUNCTION public.sync_my_account()
RETURNS TABLE(role public.app_role, status TEXT)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid UUID := auth.uid(); _email TEXT; _inv RECORD;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'must be signed in'; END IF;
  SELECT u.email INTO _email FROM auth.users u WHERE u.id = _uid;

  INSERT INTO public.profiles (user_id, email, last_login_at)
  VALUES (_uid, _email, now())
  ON CONFLICT (user_id) DO UPDATE SET email = EXCLUDED.email, last_login_at = now(), updated_at = now();

  FOR _inv IN
    SELECT * FROM public.admin_invitations
    WHERE lower(email) = lower(_email) AND status = 'pending' AND expires_at > now()
  LOOP
    INSERT INTO public.user_roles (user_id, role) VALUES (_uid, _inv.role)
      ON CONFLICT (user_id, role) DO NOTHING;
    UPDATE public.admin_invitations SET status='accepted', accepted_at=now(), accepted_by=_uid WHERE id = _inv.id;
    INSERT INTO public.admin_audit_log (actor_id, actor_email, action, target_email, target_user_id, metadata)
      VALUES (_uid, _email, 'auto_accept_invitation', _email, _uid,
              jsonb_build_object('invitation_id', _inv.id, 'role', _inv.role));
  END LOOP;

  RETURN QUERY SELECT ur.role, ur.status FROM public.user_roles ur WHERE ur.user_id = _uid;
END; $$;

REVOKE EXECUTE ON FUNCTION public.sync_my_account() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.sync_my_account() TO authenticated;

-- 7. admin directory listing
CREATE OR REPLACE FUNCTION public.list_admin_users()
RETURNS TABLE(user_id UUID, email TEXT, role public.app_role, status TEXT,
              granted_at TIMESTAMPTZ, last_login_at TIMESTAMPTZ, user_created_at TIMESTAMPTZ)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT (public.has_role(auth.uid(),'admin') OR public.is_super_admin(auth.uid())) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  RETURN QUERY
    SELECT ur.user_id, u.email::TEXT, ur.role, ur.status, ur.created_at,
           p.last_login_at, u.created_at
    FROM public.user_roles ur
    JOIN auth.users u ON u.id = ur.user_id
    LEFT JOIN public.profiles p ON p.user_id = ur.user_id
    ORDER BY ur.created_at;
END; $$;

REVOKE EXECUTE ON FUNCTION public.list_admin_users() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.list_admin_users() TO authenticated;

-- 8. grant / change role
CREATE OR REPLACE FUNCTION public.assign_role(_email TEXT, _role public.app_role)
RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _actor UUID := auth.uid(); _actor_email TEXT; _target UUID; _super_count INT; _inv_id UUID;
BEGIN
  SELECT COUNT(*) INTO _super_count FROM public.user_roles WHERE role = 'super_admin'::public.app_role;
  IF _super_count > 0 AND NOT public.is_super_admin(_actor) THEN
    RAISE EXCEPTION 'forbidden: super admin only';
  END IF;
  IF _super_count = 0 AND NOT public.has_role(_actor,'admin') THEN
    RAISE EXCEPTION 'forbidden: admin only';
  END IF;
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

REVOKE EXECUTE ON FUNCTION public.assign_role(TEXT, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.assign_role(TEXT, public.app_role) TO authenticated;

-- 9. remove role
CREATE OR REPLACE FUNCTION public.remove_role(_user_id UUID, _role public.app_role)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _actor UUID := auth.uid(); _actor_email TEXT; _target_email TEXT; _super_count INT;
BEGIN
  IF NOT public.is_super_admin(_actor) THEN RAISE EXCEPTION 'forbidden: super admin only'; END IF;
  IF _role = 'super_admin'::public.app_role THEN
    SELECT COUNT(*) INTO _super_count FROM public.user_roles WHERE role = 'super_admin'::public.app_role;
    IF _super_count <= 1 THEN RAISE EXCEPTION 'cannot remove the last super admin'; END IF;
  END IF;
  SELECT email INTO _actor_email FROM auth.users WHERE id = _actor;
  SELECT email INTO _target_email FROM auth.users WHERE id = _user_id;
  DELETE FROM public.user_roles WHERE user_id = _user_id AND role = _role;
  INSERT INTO public.admin_audit_log (actor_id, actor_email, action, target_email, target_user_id, metadata)
    VALUES (_actor, _actor_email, 'remove_role', _target_email, _user_id, jsonb_build_object('role', _role));
END; $$;

REVOKE EXECUTE ON FUNCTION public.remove_role(UUID, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.remove_role(UUID, public.app_role) TO authenticated;

-- 10. suspend / reactivate
CREATE OR REPLACE FUNCTION public.set_role_status(_user_id UUID, _role public.app_role, _status TEXT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _actor UUID := auth.uid(); _actor_email TEXT; _target_email TEXT; _active_supers INT;
BEGIN
  IF NOT public.is_super_admin(_actor) THEN RAISE EXCEPTION 'forbidden: super admin only'; END IF;
  IF _status NOT IN ('active','suspended') THEN RAISE EXCEPTION 'invalid status'; END IF;
  IF _status = 'suspended' AND _role = 'super_admin'::public.app_role THEN
    SELECT COUNT(*) INTO _active_supers FROM public.user_roles
      WHERE role = 'super_admin'::public.app_role AND status = 'active';
    IF _active_supers <= 1 THEN RAISE EXCEPTION 'cannot suspend the last active super admin'; END IF;
  END IF;
  SELECT email INTO _actor_email FROM auth.users WHERE id = _actor;
  SELECT email INTO _target_email FROM auth.users WHERE id = _user_id;
  UPDATE public.user_roles SET status = _status, updated_at = now()
    WHERE user_id = _user_id AND role = _role;
  INSERT INTO public.admin_audit_log (actor_id, actor_email, action, target_email, target_user_id, metadata)
    VALUES (_actor, _actor_email, 'set_role_status', _target_email, _user_id,
            jsonb_build_object('role', _role, 'status', _status));
END; $$;

REVOKE EXECUTE ON FUNCTION public.set_role_status(UUID, public.app_role, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_role_status(UUID, public.app_role, TEXT) TO authenticated;

-- 11. pending invitations (admin readable)
CREATE OR REPLACE FUNCTION public.list_role_invitations()
RETURNS SETOF public.admin_invitations
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') AND NOT public.is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  RETURN QUERY SELECT * FROM public.admin_invitations ORDER BY created_at DESC LIMIT 200;
END; $$;

REVOKE EXECUTE ON FUNCTION public.list_role_invitations() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.list_role_invitations() TO authenticated;