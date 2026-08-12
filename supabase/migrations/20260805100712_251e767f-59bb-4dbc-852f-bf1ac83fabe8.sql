DROP POLICY IF EXISTS "Published comparisons are public" ON public.tool_comparisons;

CREATE POLICY "Anon can read published comparisons"
  ON public.tool_comparisons FOR SELECT TO anon
  USING (published = true);

CREATE POLICY "Authenticated can read published or own-role comparisons"
  ON public.tool_comparisons FOR SELECT TO authenticated
  USING (
    published = true
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'super_admin'::public.app_role)
    OR public.has_role(auth.uid(), 'editor'::public.app_role)
  );

GRANT SELECT ON public.tool_comparisons TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tool_comparisons TO authenticated;
GRANT ALL ON public.tool_comparisons TO service_role;