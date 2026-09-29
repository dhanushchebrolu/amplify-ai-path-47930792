
-- Lock down SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated, anon, service_role;

REVOKE EXECUTE ON FUNCTION public.handle_new_user_role() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.handle_new_user_role() TO service_role;

ALTER FUNCTION public.touch_updated_at() SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.touch_updated_at() TO authenticated, service_role;
