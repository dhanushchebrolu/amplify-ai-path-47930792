ALTER TABLE public.tool_comparison_data
  ADD COLUMN IF NOT EXISTS verification_status text NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS verified_by uuid,
  ADD COLUMN IF NOT EXISTS verification_note text,
  ADD COLUMN IF NOT EXISTS source_url text;

DO $$ BEGIN
  ALTER TABLE public.tool_comparison_data
    ADD CONSTRAINT tool_comparison_data_verification_status_chk
    CHECK (verification_status IN ('draft','needs_review','verified'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Backfill: previously "published" rows were never human-verified, so treat them as needing review.
UPDATE public.tool_comparison_data SET verification_status = 'needs_review' WHERE status = 'published' AND verification_status = 'draft';

-- Public may only read verified comparison profiles.
DROP POLICY IF EXISTS "Public read comparison" ON public.tool_comparison_data;
CREATE POLICY "Public read verified comparison"
  ON public.tool_comparison_data
  FOR SELECT
  TO anon, authenticated
  USING (verification_status = 'verified');

DROP TRIGGER IF EXISTS touch_tool_comparison_data ON public.tool_comparison_data;
CREATE TRIGGER touch_tool_comparison_data
  BEFORE UPDATE ON public.tool_comparison_data
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();