
-- Revoke default PUBLIC EXECUTE and anon access on SECURITY DEFINER functions.
REVOKE ALL ON FUNCTION public.invite_admin(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.revoke_admin(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.accept_admin_invitation(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.list_admins() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;

-- Re-grant EXECUTE only to authenticated for functions that must be RPC-callable.
-- The functions themselves enforce admin-only access internally via has_role().
GRANT EXECUTE ON FUNCTION public.invite_admin(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.revoke_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.accept_admin_invitation(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.list_admins() TO authenticated;

-- has_role is used inside RLS policies evaluated as the querying role, so
-- authenticated must retain EXECUTE. Anon no longer can call it.
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

-- Ensure service_role can always execute for server-side admin flows.
GRANT EXECUTE ON FUNCTION public.invite_admin(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.revoke_admin(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.accept_admin_invitation(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.list_admins() TO service_role;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;
