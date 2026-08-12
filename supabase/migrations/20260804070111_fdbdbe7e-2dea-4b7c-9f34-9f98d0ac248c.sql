REVOKE ALL ON public.bug_reports FROM anon;
GRANT INSERT ON public.bug_reports TO anon;
REVOKE ALL ON public.bug_reports FROM authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bug_reports TO authenticated;
GRANT ALL ON public.bug_reports TO service_role;

DROP POLICY IF EXISTS "Anyone can submit a bug report" ON public.bug_reports;
CREATE POLICY "Anyone can submit a bug report"
ON public.bug_reports FOR INSERT TO anon, authenticated
WITH CHECK (
  status = 'new'
  AND severity = ANY (ARRAY['low','medium','high','critical','contact'])
  AND char_length(title) BETWEEN 1 AND 200
  AND char_length(description) BETWEEN 1 AND 4000
  AND (reporter_email IS NULL OR (char_length(reporter_email) <= 320 AND reporter_email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'))
  AND (page_url IS NULL OR (char_length(page_url) <= 2000 AND page_url ~ '^https?://'))
);