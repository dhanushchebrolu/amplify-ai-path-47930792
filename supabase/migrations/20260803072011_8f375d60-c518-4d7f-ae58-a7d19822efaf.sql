DROP POLICY IF EXISTS "Public read verified comparison" ON public.tool_comparison_data;
DROP POLICY IF EXISTS "Public read comparison" ON public.tool_comparison_data;
CREATE POLICY "Public read comparison" ON public.tool_comparison_data
  FOR SELECT TO anon, authenticated USING (true);

UPDATE public.tool_comparison_data
  SET status = 'published', verification_status = 'verified'
  WHERE verification_status <> 'verified';

ALTER TABLE public.tool_comparison_data ALTER COLUMN status SET DEFAULT 'published';
ALTER TABLE public.tool_comparison_data ALTER COLUMN verification_status SET DEFAULT 'verified';