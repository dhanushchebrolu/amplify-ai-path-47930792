# Archived migrations

These files are kept for history only. The Supabase CLI does not read this
folder, so they are never applied.

- `20260529133144` … `20260629165109`: the original project's history. The
  `supabase/migrations/20260722111346_…` baseline re-creates everything they
  built, so applying both fails ("type app_role already exists").
- `20260812053625_…`: re-creates `tool_comparison_data` and `tool_comparisons`,
  which the baseline and later migrations already create; it fails on any
  database built from the baseline and adds nothing beyond a duplicate
  `updated_at` trigger.

The only objects these files created that the baseline did not (the
`content-images` storage bucket and three `seo_generated_at` indexes) are added
by `supabase/migrations/20260929100000_content_images_bucket_and_seo_indexes.sql`.

A new database is built by applying `supabase/migrations/` in filename order.
