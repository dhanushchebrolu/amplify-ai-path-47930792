-- Objects the 20260722111346 baseline does not create. They were only created
-- by the pre-baseline history (now in supabase/migrations_archive/), so a
-- project built from the baseline was missing them.

-- Public bucket for admin-uploaded blog/content images. Its RLS policies on
-- storage.objects are already created by the baseline migration.
INSERT INTO storage.buckets (id, name, public)
VALUES ('content-images', 'content-images', true)
ON CONFLICT (id) DO NOTHING;

-- Used when scanning for content that still needs SEO generation.
CREATE INDEX IF NOT EXISTS tools_seo_generated_at_idx ON public.tools (seo_generated_at);
CREATE INDEX IF NOT EXISTS categories_seo_generated_at_idx ON public.categories (seo_generated_at);
CREATE INDEX IF NOT EXISTS subcategories_seo_generated_at_idx ON public.subcategories (seo_generated_at);
