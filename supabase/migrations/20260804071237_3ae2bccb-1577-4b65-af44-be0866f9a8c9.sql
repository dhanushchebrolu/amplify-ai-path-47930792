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

CREATE POLICY "Published comparisons are public"
  ON public.tool_comparisons FOR SELECT
  USING (published = true OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'editor'));

CREATE POLICY "Editors manage comparisons"
  ON public.tool_comparisons FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'editor'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'editor'));

CREATE INDEX tool_comparisons_matchup_idx ON public.tool_comparisons (matchup);

CREATE TRIGGER tool_comparisons_touch
  BEFORE UPDATE ON public.tool_comparisons
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();