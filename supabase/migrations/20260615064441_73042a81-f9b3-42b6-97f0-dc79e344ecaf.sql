
CREATE TABLE IF NOT EXISTS public.seo_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind TEXT NOT NULL CHECK (kind IN ('category','subcategory','tool')),
  slug_path TEXT NOT NULL,
  seo_title TEXT,
  seo_description TEXT,
  og_title TEXT,
  og_description TEXT,
  twitter_title TEXT,
  twitter_description TEXT,
  long_form JSONB,
  structured_data JSONB,
  model TEXT,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (kind, slug_path)
);

GRANT SELECT ON public.seo_content TO anon, authenticated;
GRANT ALL ON public.seo_content TO service_role;

ALTER TABLE public.seo_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read seo_content" ON public.seo_content
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "admins write seo_content" ON public.seo_content
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS seo_content_kind_slug_idx ON public.seo_content (kind, slug_path);

CREATE TRIGGER seo_content_touch_updated_at
  BEFORE UPDATE ON public.seo_content
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
