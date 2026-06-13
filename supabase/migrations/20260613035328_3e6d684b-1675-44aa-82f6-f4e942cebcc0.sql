
-- 1. Remove the auto-admin trigger and function (privilege-escalation risk)
DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;
DROP TRIGGER IF EXISTS handle_new_user_role_trigger ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_role() CASCADE;

-- 2. Admin invitations table
CREATE TABLE public.admin_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  token UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','revoked','expired')),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at TIMESTAMPTZ,
  accepted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_admin_invitations_email ON public.admin_invitations(lower(email));
CREATE INDEX idx_admin_invitations_token ON public.admin_invitations(token);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_invitations TO authenticated;
GRANT ALL ON public.admin_invitations TO service_role;
ALTER TABLE public.admin_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read invitations" ON public.admin_invitations
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage invitations" ON public.admin_invitations
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 3. Admin audit log
CREATE TABLE public.admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_email TEXT,
  action TEXT NOT NULL,
  target_email TEXT,
  target_user_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_admin_audit_created ON public.admin_audit_log(created_at DESC);

GRANT SELECT ON public.admin_audit_log TO authenticated;
GRANT ALL ON public.admin_audit_log TO service_role;
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read audit log" ON public.admin_audit_log
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 4. invite_admin RPC
CREATE OR REPLACE FUNCTION public.invite_admin(_email TEXT)
RETURNS public.admin_invitations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _actor UUID := auth.uid();
  _actor_email TEXT;
  _inv public.admin_invitations;
BEGIN
  IF _actor IS NULL OR NOT public.has_role(_actor, 'admin') THEN
    RAISE EXCEPTION 'forbidden: admin only';
  END IF;
  IF _email IS NULL OR _email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN
    RAISE EXCEPTION 'invalid email';
  END IF;

  SELECT email INTO _actor_email FROM auth.users WHERE id = _actor;

  INSERT INTO public.admin_invitations (email, invited_by)
  VALUES (lower(_email), _actor)
  RETURNING * INTO _inv;

  INSERT INTO public.admin_audit_log (actor_id, actor_email, action, target_email, metadata)
  VALUES (_actor, _actor_email, 'invite_admin', lower(_email), jsonb_build_object('invitation_id', _inv.id));

  RETURN _inv;
END;
$$;

-- 5. revoke_admin RPC (with last-admin lockout protection)
CREATE OR REPLACE FUNCTION public.revoke_admin(_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _actor UUID := auth.uid();
  _actor_email TEXT;
  _target_email TEXT;
  _admin_count INT;
BEGIN
  IF _actor IS NULL OR NOT public.has_role(_actor, 'admin') THEN
    RAISE EXCEPTION 'forbidden: admin only';
  END IF;

  SELECT COUNT(*) INTO _admin_count FROM public.user_roles WHERE role = 'admin';
  IF _admin_count <= 1 THEN
    RAISE EXCEPTION 'cannot revoke the last admin';
  END IF;

  SELECT email INTO _actor_email FROM auth.users WHERE id = _actor;
  SELECT email INTO _target_email FROM auth.users WHERE id = _user_id;

  DELETE FROM public.user_roles WHERE user_id = _user_id AND role = 'admin';

  INSERT INTO public.admin_audit_log (actor_id, actor_email, action, target_email, target_user_id)
  VALUES (_actor, _actor_email, 'revoke_admin', _target_email, _user_id);
END;
$$;

-- 6. accept_admin_invitation RPC — called by a signed-in user with their invitation token
CREATE OR REPLACE FUNCTION public.accept_admin_invitation(_token UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user UUID := auth.uid();
  _user_email TEXT;
  _inv public.admin_invitations;
BEGIN
  IF _user IS NULL THEN
    RAISE EXCEPTION 'must be signed in';
  END IF;

  SELECT email INTO _user_email FROM auth.users WHERE id = _user;

  SELECT * INTO _inv FROM public.admin_invitations
  WHERE token = _token AND status = 'pending' AND expires_at > now()
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'invitation invalid or expired';
  END IF;
  IF lower(_inv.email) <> lower(_user_email) THEN
    RAISE EXCEPTION 'invitation email does not match signed-in account';
  END IF;

  INSERT INTO public.user_roles (user_id, role) VALUES (_user, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;

  UPDATE public.admin_invitations
  SET status = 'accepted', accepted_at = now(), accepted_by = _user
  WHERE id = _inv.id;

  INSERT INTO public.admin_audit_log (actor_id, actor_email, action, target_email, target_user_id, metadata)
  VALUES (_user, _user_email, 'accept_invitation', _user_email, _user, jsonb_build_object('invitation_id', _inv.id, 'invited_by', _inv.invited_by));
END;
$$;

-- 7. list_admins RPC
CREATE OR REPLACE FUNCTION public.list_admins()
RETURNS TABLE(user_id UUID, email TEXT, granted_at TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  RETURN QUERY
  SELECT ur.user_id, u.email::TEXT, ur.created_at
  FROM public.user_roles ur
  JOIN auth.users u ON u.id = ur.user_id
  WHERE ur.role = 'admin'
  ORDER BY ur.created_at;
END;
$$;

GRANT EXECUTE ON FUNCTION public.invite_admin(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.revoke_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.accept_admin_invitation(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.list_admins() TO authenticated;
