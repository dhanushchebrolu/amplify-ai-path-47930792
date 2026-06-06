
-- Fix 1: Blog public read should only return published posts
DROP POLICY IF EXISTS "Public read blog" ON public.blog_posts;
CREATE POLICY "Public read published blog"
ON public.blog_posts
FOR SELECT
USING (published = true);

-- Fix 2 + 5: Tighten bug_reports INSERT policy (replace WITH CHECK true)
DROP POLICY IF EXISTS "Anyone can submit a bug report" ON public.bug_reports;
CREATE POLICY "Anyone can submit a bug report"
ON public.bug_reports
FOR INSERT
TO anon, authenticated
WITH CHECK (
  status = 'new'
  AND severity IN ('low', 'medium', 'high', 'critical')
  AND char_length(title) BETWEEN 1 AND 200
  AND char_length(description) BETWEEN 1 AND 4000
  AND (reporter_email IS NULL OR char_length(reporter_email) <= 320)
  AND (page_url IS NULL OR char_length(page_url) <= 2000)
);

-- Fix 3: Public bucket listing — drop broad SELECT policy on storage.objects.
-- Files in the public bucket remain accessible via their public URLs (CDN
-- endpoint bypasses RLS); only directory listing is removed.
DROP POLICY IF EXISTS "Public read content-images" ON storage.objects;
