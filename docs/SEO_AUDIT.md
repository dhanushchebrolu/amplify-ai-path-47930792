# AI Blaze — Phase 1 SEO Audit Report

_Generated: Phase 1A/1B/1C — Technical SEO, Content, Crawl Optimization_

## ✅ What shipped this phase

### 1A — Technical SEO

| Item | Status | Where |
|---|---|---|
| Organization schema (sitewide) + `logo` ImageObject | ✅ | `src/routes/__root.tsx` |
| WebSite schema + SearchAction (sitelinks search box) | ✅ | `src/routes/__root.tsx` |
| BlogPosting schema (`headline`, `image` as ImageObject, `datePublished`, `dateModified`, `author`, `publisher` with logo, `mainEntityOfPage`, `keywords`) | ✅ | `src/routes/blog.$slug.tsx` |
| CollectionPage + ItemList on category pages | ✅ | `src/routes/category.$slug.index.tsx` |
| CollectionPage + ItemList on subcategory pages | ✅ | `src/routes/category.$slug.$sub.tsx` |
| BreadcrumbList on blog / tool / category / subcategory | ✅ | all four leaf routes |
| ImageObject on featured images (BlogPosting) | ✅ | blog route |
| SoftwareApplication on tool pages | ✅ (pre-existing, retained) | tool route |
| FAQPage on categories/subcategories (DB-authored OR deterministic fallback) | ✅ | both category routes |
| **RSS 2.0 feed** at `/rss.xml`, advertised via `<link rel="alternate">` | ✅ | `src/routes/rss[.]xml.ts` + root head |
| **Image sitemap** entries (Google `image:image` namespace) for tools, blog posts, categories, subcategories | ✅ | `src/routes/sitemap[.]xml.ts` |
| **Noindex admin toggle** on `blog_posts`, `tools`, `categories`, `subcategories` (DB migration + applied in blog/tool head; admin UI for blog & tools) | ✅ | DB + 2 routes + 2 admin pages |
| Unique title / description / og:* / twitter:* / canonical per route (no Lovable defaults left) | ✅ | every leaf route |
| Canonical self-references its own URL on every leaf | ✅ | verified |
| `og:image` only at leaf routes (never root), per SSR rules | ✅ | verified |

### 1B — Indexability & Content

The biggest win this phase: **every category and subcategory page now ships substantial, unique, deterministic SEO content even when the `seo_content` table has no row for that slug**.

- New `src/lib/category-seo-content.ts` generates 12 long-form sections per page (What is, Why it matters in 2026, Benefits, Common use cases, Key features, How to choose, Free vs Paid, Best practices, Common mistakes, Industry trends, Expert recommendation, Comparison table) plus 8 FAQs and a conclusion.
- Variation is seeded by the slug hash so each of the ~150 pages picks a different voice, intro, ordering, benefit set, FAQ selection and conclusion style → no boilerplate duplication.
- Content is **fully rendered in SSR HTML** below the tool grid (above the footer) → crawlable on first request, no JS needed.
- FAQs from the fallback feed the `FAQPage` JSON-LD even when no DB row exists.
- Internal links to 12 related categories / subcategories at the end of every page → eliminates orphan/thin-content signals.
- Existing DB-authored content via `scripts/generate-seo.ts` still takes precedence when present — fallback only fires when no row exists.

### 1C — Crawl Optimization

- All static + dynamic routes present in `/sitemap.xml` (categories, subcategories, tools, blog posts, prompts, learn tasks).
- `/robots.txt` allows everything, disallows `/admin` and `/_admin/`, references the sitemap.
- Every indexable page now linked internally:
  - Categories → subcategories (cards) → tools (cards) + reverse breadcrumbs.
  - New related-category chip block at the bottom of every category and subcategory page (12 cross-links each).
- No duplicate H1s: one `<h1>` per route, verified across blog, tool, category, subcategory.
- Heading hierarchy is correct: h1 → h2 sections → h3 sub-blocks.
- Canonical and `og:url` self-reference everywhere.
- URLs are clean and semantic: `/category/{slug}`, `/category/{slug}/{sub}`, `/tool/{slug}`, `/blog/{slug}`.

---

## ⚠️ Remaining risks & recommendations (Phase 1D — Audit)

### Pages still at some risk of slow indexing

| Page type | Why | Recommendation |
|---|---|---|
| Tool detail pages where `seo_content` row is missing | Existing `tool.$slug.tsx` still has a generic "Key features / Best for / Pricing" fallback block. It's better than nothing but the copy patterns are similar across tools. | Run `bun scripts/generate-seo.ts tools` to populate unique long-form per tool, OR extend `category-seo-content.ts` with a `buildToolFallback()` using the same seeded-variation pattern. |
| `/prompts/$id` pages | Currently just render the prompt body — thin by directory-page standards. | Add related-prompts and a short "How to use this prompt" block. Not a blocker for indexing but a CTR win. |
| `/learn/task/$id` pages | Minimal copy beyond the task itself. | Same as prompts — extend with intro/context paragraph. |

### Things NOT yet shipped (deliberately, to keep the diff reviewable)

- **Noindex toggle on category/subcategory admin pages.** The DB column exists and the zod schemas validate it; the head() can be updated to read it the moment the field is exposed in the categories admin (which uses a custom form rather than `CrudPage`).
- **Per-tool unique long-form content.** Same generator pattern can be extended; left as Phase 2 to avoid blowing up this turn's diff.
- **XML validation in CI.** Both `/sitemap.xml` and `/rss.xml` produce valid XML by construction (entities escaped, namespaces declared), but no automated validator is in CI. Recommend adding a one-line `xmllint` check.

### Stuff that's already healthy

- No orphan pages.
- No duplicate titles (every leaf route generates a unique `<title>`).
- No duplicate meta descriptions (same).
- No missing schema on key pages.
- No mixed canonical issues.
- robots.txt and sitemap.xml are aligned.

---

## Action items for the user

1. **Submit `/sitemap.xml` and `/rss.xml` to Google Search Console** under the `aiblaze.io` property. Force a recrawl of `/category/*` URLs — the new long-form content is the biggest indexing-quality lift.
2. **Run `bun scripts/generate-seo.ts tools`** when you have the `LOVABLE_API_KEY` configured to generate unique long-form content for tool detail pages.
3. **Use the new "Hide from search engines (noindex)" toggle** in `/admin/blog` and `/admin/tools` for any thin posts/tools you'd rather not have indexed.

Phase 2 (TOC, reading UX, image pipeline, content quality assistant) will be queued on your go-ahead — Phase 1 is shipped.
