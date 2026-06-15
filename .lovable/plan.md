## Scope (from your answers)

- **All category pages** (23) — long intro above the grid, FAQs / buying guide / conclusion below.
- **All subcategory pages** (152) — same treatment, scoped to the subcategory.
- **All tool detail pages** (1,917) — deep guide, comparison block, FAQs, JSON-LD.
- Every page must read as if **independently written by a domain expert**: different ordering, examples, FAQs, recommendations, comparisons, conclusion.
- Content **stored in the database**, served from initial HTML (SSR-friendly, indexable, editable in admin).

Total: **2,092 pages** of unique long-form content.

## Important upfront

Generating 2,092 expert-quality pages with Lovable AI will take ~1–3 hours of generation time and consume meaningful workspace credits (rough order: 2,092 × ~3K output tokens). I'll generate in batches with resume support so we can pause/restart and so a failure doesn't redo finished pages.

If you'd rather start with categories + subcategories first (175 pages, fast) and queue tools as a second pass, say the word — otherwise I run the whole set.

## Architecture

### 1. DB migration — add SEO content columns

Add to `categories`, `subcategories`, `tools`:

- `seo_title`, `seo_description`, `seo_slug` (text)
- `og_title`, `og_description`, `twitter_title`, `twitter_description` (text)
- `long_form` (jsonb) — structured sections: `intro`, `sections[]` (each `{heading, body}` with **route-randomised order/headings**), `faqs[]` (`{q,a}`), `buying_guide`, `comparison_table` (tools only), `conclusion`
- `structured_data` (jsonb) — pre-rendered JSON-LD blocks (`WebPage`, `BreadcrumbList`, `FAQPage`, `ItemList`/`Article`, etc.)
- `seo_generated_at` (timestamptz)

Editable in the existing admin CRUD pages.

### 2. Generation pipeline (`scripts/seo-generate.ts`)

- Reads rows with `seo_generated_at IS NULL`.
- For each row, builds a **per-row prompt seeded with the row's id** so the model picks a different writing voice, section order, FAQ set, and example mix every time (we pass an enum of "voice profiles", "ordering profiles", "FAQ angles" hashed from the id — guarantees deterministic uniqueness across pages and prevents two pages from collapsing into the same template).
- Calls Lovable AI (`google/gemini-3-flash-preview`) with strict JSON schema → validates with Zod → upserts into the new columns.
- Writes a `seo_generation_log` row per attempt (success/failure/cost) so we can resume.
- Concurrency: 6 parallel requests, exponential backoff on 429.
- Resumable: re-running skips already-generated rows.

### 3. Route rendering (SSR-first, zero JS-only content)

For `category.$slug.index.tsx`, `category.$slug.$sub.tsx`, `tool.$slug.tsx`:

- Loader fetches the row (already done) + the new `long_form` / `structured_data`.
- `head()` emits SEO + OG + Twitter meta from DB, self-referencing `canonical`, `og:url`, and `robots: index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1`.
- Body renders intro → tool grid → sections → FAQs (semantic `<details>`, no JS gate) → buying guide → conclusion → comparison table (tools).
- JSON-LD injected via `scripts: [{type: "application/ld+json", children: JSON.stringify(...)}]`.
- Single `<h1>`, proper `<h2>`/`<h3>` hierarchy, `alt` text for images.

### 4. Sitemap & robots

- Verify `sitemap.xml` includes every category/subcategory/tool with `lastmod = seo_generated_at`.
- `robots.txt` already permissive — no change.

### 5. Admin editing

`_admin.admin.categories.tsx`, `…subcategories…`, `…tools.tsx` already use the generic `CrudPage`. I'll add textarea/jsonb fields so editors can override AI output later. A "Regenerate SEO" button per row calls the generator for just that row.

## Execution order

1. Migration: add columns + log table (you approve).
2. Wire empty rendering (routes read from DB, fall back gracefully when columns are empty — no visual regression).
3. Generate **categories** (23 pages, ~3 min).
4. Generate **subcategories** (152 pages, ~15 min).
5. Generate **tools** (1,917 pages, batched; ~1–3 h depending on rate limits).
6. Add the "Regenerate" admin action.
7. Re-verify sitemap, run SEO scan.

## What stays unchanged

- No UI redesign. Long-form sections slot **below** existing grids using the current design tokens.
- No business-logic changes to tool/category schemas beyond additive columns.
- No client-side fetching of SEO copy — everything ships in the initial HTML.

## Confirm before I start

1. Run the **full 2,092-page** generation, or **categories+subcategories first** and tools in a second turn?
2. Default chat model `google/gemini-3-flash-preview` is great for breadth + cost. Want me to upgrade tool detail pages to `google/gemini-3-pro-preview` for the longest tier (more expensive, sharper writing)?