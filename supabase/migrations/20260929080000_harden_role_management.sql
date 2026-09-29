-- Harden role management.
--
-- * Role tables are read-only for API roles; every change goes through the
--   SECURITY DEFINER RPCs below (they run as the table owner, so they keep
--   working). Supabase's default privileges grant ALL on new public tables to
--   anon/authenticated, which the earlier "GRANT SELECT" did not undo.
-- * Only an active super admin can grant super_admin. The first super admin is
--   created out-of-band with bootstrap_super_admin() (service role only).
-- * Invitations (matched by email) are only claimed by accounts whose email is
--   confirmed, and a super_admin invitation is only honoured if its inviter is
--   an active super admin.
-- * sync_my_account() no longer fails with "column reference status is
--   ambiguous" (its OUT column names clashed with table columns).

-- 1. Table privileges -------------------------------------------------------
REVOKE ALL ON public.user_roles FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

REVOKE ALL ON public.admin_invitations FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.admin_invitations TO authenticated;
GRANT ALL ON public.admin_invitations TO service_role;

REVOKE ALL ON public.admin_audit_log FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.admin_audit_log TO authenticated;
GRANT ALL ON public.admin_audit_log TO service_role;

-- 2. RLS: replace write-capable policies with read-only ones -----------------
-- (defence in depth if a write grant is ever re-added)
DROP POLICY IF EXISTS "Admins manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins read roles" ON public.user_roles;
CREATE POLICY "Admins read roles" ON public.user_roles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.is_super_admin(auth.uid()));
-- "Users can see own roles" (SELECT) is unchanged.

DROP POLICY IF EXISTS "Admins manage invitations" ON public.admin_invitations;
-- "Admins read invitations" (SELECT) is unchanged.

-- 3. assign_role: super_admin can only be granted by an active super admin ---
CREATE OR REPLACE FUNCTION public.assign_role(_email TEXT, _role public.app_role)
RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _actor UUID := auth.uid(); _actor_email TEXT; _target UUID; _super_count INT; _inv_id UUID;
BEGIN
  IF _actor IS NULL THEN RAISE EXCEPTION 'forbidden: must be signed in'; END IF;
  IF _role = 'super_admin'::public.app_role AND NOT public.is_super_admin(_actor) THEN
    RAISE EXCEPTION 'forbidden: only a super admin can grant super_admin';
  END IF;

  SELECT COUNT(*) INTO _super_count FROM public.user_roles WHERE role = 'super_admin'::public.app_role;
  IF _super_count > 0 AND NOT public.is_super_admin(_actor) THEN
    RAISE EXCEPTION 'forbidden: super admin only';
  END IF;
  -- Bootstrap (no super admin yet): admins may grant non-super roles only.
  IF _super_count = 0 AND NOT public.has_role(_actor, 'admin') THEN
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

REVOKE ALL ON FUNCTION public.assign_role(TEXT, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.assign_role(TEXT, public.app_role) TO authenticated, service_role;

-- 4. First super admin: explicit, service-role-only bootstrap ----------------
-- Run once from the Supabase SQL editor (or with the service role key):
--   SELECT public.bootstrap_super_admin('owner@example.com');
CREATE OR REPLACE FUNCTION public.bootstrap_super_admin(_email TEXT)
RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _target UUID; _confirmed TIMESTAMPTZ;
BEGIN
  IF EXISTS (SELECT 1 FROM public.user_roles
             WHERE role = 'super_admin'::public.app_role AND status = 'active') THEN
    RAISE EXCEPTION 'a super admin already exists; use assign_role as that super admin';
  END IF;
  SELECT id, email_confirmed_at INTO _target, _confirmed
    FROM auth.users WHERE lower(email) = lower(_email) LIMIT 1;
  IF _target IS NULL THEN RAISE EXCEPTION 'no account with that email'; END IF;
  IF _confirmed IS NULL THEN RAISE EXCEPTION 'email not confirmed'; END IF;

  INSERT INTO public.user_roles (user_id, role) VALUES (_target, 'super_admin')
    ON CONFLICT (user_id, role) DO UPDATE SET status = 'active', updated_at = now();
  INSERT INTO public.admin_audit_log (actor_id, actor_email, action, target_email, target_user_id, metadata)
    VALUES (NULL, 'service_role', 'bootstrap_super_admin', lower(_email), _target,
            jsonb_build_object('role', 'super_admin'));
  RETURN 'assigned';
END; $$;

REVOKE ALL ON FUNCTION public.bootstrap_super_admin(TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.bootstrap_super_admin(TEXT) TO service_role;

-- 5. sync_my_account: confirmed email required to claim invitations ---------
CREATE OR REPLACE FUNCTION public.sync_my_account()
RETURNS TABLE(role public.app_role, status TEXT)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
#variable_conflict use_column
DECLARE _uid UUID := auth.uid(); _email TEXT; _confirmed TIMESTAMPTZ; _inv RECORD;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'must be signed in'; END IF;
  SELECT u.email, u.email_confirmed_at INTO _email, _confirmed FROM auth.users u WHERE u.id = _uid;

  INSERT INTO public.profiles (user_id, email, last_login_at)
  VALUES (_uid, _email, now())
  ON CONFLICT (user_id) DO UPDATE SET email = EXCLUDED.email, last_login_at = now(), updated_at = now();

  -- Invitations are matched by email, so only a confirmed email may claim them.
  -- Unconfirmed accounts leave them pending; they are claimed on the first
  -- sync after the email is confirmed.
  IF _confirmed IS NOT NULL THEN
    FOR _inv IN
      SELECT i.* FROM public.admin_invitations i
      WHERE lower(i.email) = lower(_email) AND i.status = 'pending' AND i.expires_at > now()
        AND (i.role <> 'super_admin'::public.app_role OR public.is_super_admin(i.invited_by))
    LOOP
      INSERT INTO public.user_roles (user_id, role) VALUES (_uid, _inv.role)
        ON CONFLICT (user_id, role) DO NOTHING;
      UPDATE public.admin_invitations SET status = 'accepted', accepted_at = now(), accepted_by = _uid
        WHERE id = _inv.id;
      INSERT INTO public.admin_audit_log (actor_id, actor_email, action, target_email, target_user_id, metadata)
        VALUES (_uid, _email, 'auto_accept_invitation', _email, _uid,
                jsonb_build_object('invitation_id', _inv.id, 'role', _inv.role));
    END LOOP;
  END IF;

  RETURN QUERY SELECT ur.role, ur.status FROM public.user_roles ur WHERE ur.user_id = _uid;
END; $$;

REVOKE ALL ON FUNCTION public.sync_my_account() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.sync_my_account() TO authenticated, service_role;

-- 6. accept_admin_invitation: confirmed email, and grant the invited role ---
-- (previously it always granted 'admin', even for editor/moderator invitations)
CREATE OR REPLACE FUNCTION public.accept_admin_invitation(_token UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _user UUID := auth.uid(); _user_email TEXT; _confirmed TIMESTAMPTZ; _inv public.admin_invitations;
BEGIN
  IF _user IS NULL THEN RAISE EXCEPTION 'must be signed in'; END IF;
  SELECT email, email_confirmed_at INTO _user_email, _confirmed FROM auth.users WHERE id = _user;
  IF _confirmed IS NULL THEN RAISE EXCEPTION 'confirm your email address before accepting the invitation'; END IF;
  SELECT * INTO _inv FROM public.admin_invitations
    WHERE token = _token AND status = 'pending' AND expires_at > now() FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'invitation invalid or expired'; END IF;
  IF lower(_inv.email) <> lower(_user_email) THEN
    RAISE EXCEPTION 'invitation email does not match signed-in account';
  END IF;
  IF _inv.role = 'super_admin'::public.app_role AND NOT public.is_super_admin(_inv.invited_by) THEN
    RAISE EXCEPTION 'invitation invalid or expired';
  END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (_user, _inv.role) ON CONFLICT (user_id, role) DO NOTHING;
  UPDATE public.admin_invitations SET status = 'accepted', accepted_at = now(), accepted_by = _user WHERE id = _inv.id;
  INSERT INTO public.admin_audit_log (actor_id, actor_email, action, target_email, target_user_id, metadata)
    VALUES (_user, _user_email, 'accept_invitation', _user_email, _user,
            jsonb_build_object('invitation_id', _inv.id, 'invited_by', _inv.invited_by, 'role', _inv.role));
END; $$;

REVOKE ALL ON FUNCTION public.accept_admin_invitation(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.accept_admin_invitation(UUID) TO authenticated, service_role;
