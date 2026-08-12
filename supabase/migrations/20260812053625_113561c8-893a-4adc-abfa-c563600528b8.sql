CREATE TABLE public.tool_comparison_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id UUID NOT NULL UNIQUE REFERENCES public.tools(id) ON DELETE CASCADE,
  company TEXT, website TEXT, launch_year INT, status TEXT DEFAULT 'published',
  open_source BOOLEAN NOT NULL DEFAULT false,
  api_available BOOLEAN NOT NULL DEFAULT false,
  pricing JSONB NOT NULL DEFAULT '{}'::jsonb,
  models JSONB NOT NULL DEFAULT '{}'::jsonb,
  features JSONB NOT NULL DEFAULT '{}'::jsonb,
  platforms JSONB NOT NULL DEFAULT '{}'::jsonb,
  languages JSONB NOT NULL DEFAULT '{}'::jsonb,
  integrations JSONB NOT NULL DEFAULT '{}'::jsonb,
  use_cases TEXT[] NOT NULL DEFAULT '{}',
  limitations JSONB NOT NULL DEFAULT '{}'::jsonb,
  pros TEXT[] NOT NULL DEFAULT '{}',
  cons TEXT[] NOT NULL DEFAULT '{}',
  media JSONB NOT NULL DEFAULT '{}'::jsonb,
  seo JSONB NOT NULL DEFAULT '{}'::jsonb,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  verification_status text NOT NULL DEFAULT 'verified',
  verified_at timestamptz,
  verified_by uuid,
  verification_note text,
  source_url text,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT tool_comparison_data_verification_status_chk CHECK (verification_status IN ('draft','needs_review','verified'))
);
CREATE INDEX idx_tool_comparison_tool_id ON public.tool_comparison_data(tool_id);
GRANT SELECT ON public.tool_comparison_data TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.tool_comparison_data TO authenticated;
GRANT ALL ON public.tool_comparison_data TO service_role;
ALTER TABLE public.tool_comparison_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read comparison" ON public.tool_comparison_data FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin write comparison" ON public.tool_comparison_data FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER tool_comparison_data_touch BEFORE UPDATE ON public.tool_comparison_data
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.tool_comparisons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  matchup text NOT NULL UNIQUE,
  slugs text[] NOT NULL DEFAULT '{}',
  headline text,
  intro text,
  quick_summary jsonb NOT NULL DEFAULT '[]'::jsonb,
  category_winners jsonb NOT NULL DEFAULT '[]'::jsonb,
  verdicts jsonb NOT NULL DEFAULT '{}'::jsonb,
  faqs jsonb NOT NULL DEFAULT '[]'::jsonb,
  long_form jsonb NOT NULL DEFAULT '[]'::jsonb,
  seo_title text,
  seo_description text,
  published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.tool_comparisons TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tool_comparisons TO authenticated;
GRANT ALL ON public.tool_comparisons TO service_role;
ALTER TABLE public.tool_comparisons ENABLE ROW LEVEL SECURITY;
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
CREATE POLICY "Editors manage comparisons"
  ON public.tool_comparisons FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'editor'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'editor'));
CREATE INDEX tool_comparisons_matchup_idx ON public.tool_comparisons (matchup);
CREATE TRIGGER tool_comparisons_touch
  BEFORE UPDATE ON public.tool_comparisons
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();