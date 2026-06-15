
-- Long-form SEO columns on the three content tables
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS seo_title TEXT,
  ADD COLUMN IF NOT EXISTS seo_description TEXT,
  ADD COLUMN IF NOT EXISTS seo_slug TEXT,
  ADD COLUMN IF NOT EXISTS og_title TEXT,
  ADD COLUMN IF NOT EXISTS og_description TEXT,
  ADD COLUMN IF NOT EXISTS twitter_title TEXT,
  ADD COLUMN IF NOT EXISTS twitter_description TEXT,
  ADD COLUMN IF NOT EXISTS long_form JSONB,
  ADD COLUMN IF NOT EXISTS structured_data JSONB,
  ADD COLUMN IF NOT EXISTS seo_generated_at TIMESTAMPTZ;

ALTER TABLE public.subcategories
  ADD COLUMN IF NOT EXISTS seo_title TEXT,
  ADD COLUMN IF NOT EXISTS seo_description TEXT,
  ADD COLUMN IF NOT EXISTS seo_slug TEXT,
  ADD COLUMN IF NOT EXISTS og_title TEXT,
  ADD COLUMN IF NOT EXISTS og_description TEXT,
  ADD COLUMN IF NOT EXISTS twitter_title TEXT,
  ADD COLUMN IF NOT EXISTS twitter_description TEXT,
  ADD COLUMN IF NOT EXISTS long_form JSONB,
  ADD COLUMN IF NOT EXISTS structured_data JSONB,
  ADD COLUMN IF NOT EXISTS seo_generated_at TIMESTAMPTZ;

ALTER TABLE public.tools
  ADD COLUMN IF NOT EXISTS seo_title TEXT,
  ADD COLUMN IF NOT EXISTS seo_description TEXT,
  ADD COLUMN IF NOT EXISTS seo_slug TEXT,
  ADD COLUMN IF NOT EXISTS og_title TEXT,
  ADD COLUMN IF NOT EXISTS og_description TEXT,
  ADD COLUMN IF NOT EXISTS twitter_title TEXT,
  ADD COLUMN IF NOT EXISTS twitter_description TEXT,
  ADD COLUMN IF NOT EXISTS long_form JSONB,
  ADD COLUMN IF NOT EXISTS structured_data JSONB,
  ADD COLUMN IF NOT EXISTS seo_generated_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS categories_seo_generated_at_idx ON public.categories (seo_generated_at);
CREATE INDEX IF NOT EXISTS subcategories_seo_generated_at_idx ON public.subcategories (seo_generated_at);
CREATE INDEX IF NOT EXISTS tools_seo_generated_at_idx ON public.tools (seo_generated_at);

-- Generation log: tracks attempts so the script can resume
CREATE TABLE IF NOT EXISTS public.seo_generation_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_table TEXT NOT NULL CHECK (target_table IN ('categories','subcategories','tools')),
  target_id UUID NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success','error')),
  model TEXT,
  error TEXT,
  prompt_tokens INT,
  completion_tokens INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.seo_generation_log TO authenticated;
GRANT ALL ON public.seo_generation_log TO service_role;

ALTER TABLE public.seo_generation_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins read seo log" ON public.seo_generation_log
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins write seo log" ON public.seo_generation_log
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS seo_generation_log_target_idx
  ON public.seo_generation_log (target_table, target_id, created_at DESC);
