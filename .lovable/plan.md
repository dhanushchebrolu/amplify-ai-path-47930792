# AIBlaze full audit & migration plan

This is a large, multi-area change. I'll execute it in the order below. Before I start, I need a few confirmations because some decisions are irreversible or depend on infrastructure you control.

## Questions I need answered first

1. **Domain DNS** — Is `https://aiblaze.io` already pointed at this Lovable project (custom domain connected in Project Settings)? If not, I'll still bake `https://aiblaze.io` into all canonical/OG/sitemap URLs as you asked, but the site won't actually resolve there until you connect the domain.
2. **Static catalog removal** — `src/data/catalog.ts` and `src/data/tools.ts` are imported by ~10 pages (home, browse, ranking, category pages, tool detail, search, sitemap, InfiniteMenu, etc.). Confirm: **delete the static files entirely** and rebuild every page on Supabase queries? This will visibly change the home/browse/ranking pages while Supabase is being populated. If the DB is missing tools, those pages will look empty until you import data.
3. **Has the catalog been synced into Supabase already?** Earlier we created `scripts/sync-catalog.ts`. Did that run? If `tools`/`categories`/`subcategories` are mostly empty, removing the static files = empty site. I should run the sync first.
4. **Favicon** — Do you have an AIBlaze logo file to upload, or should I generate one (simple wordmark / flame icon)?

## Phase-by-phase plan

### Phase 1 — Database as single source of truth
- Run `scripts/sync-catalog.ts` to push every static catalog row into Supabase `categories`, `subcategories`, `tools` (idempotent upsert by slug).
- Rewrite `src/routes/tool.$slug.tsx` to query `tools` table by slug via a public server fn (admin client, safe column projection). Only show 404 when DB row is genuinely absent.
- Rewrite `src/routes/category.$slug.index.tsx` and `category.$slug.$sub.tsx` to query Supabase.
- Rewrite `src/routes/browse.tsx`, `ranking.tsx`, `search.tsx`, home `index.tsx` sections that read `catalog`/`tools` to read from Supabase via server fns.
- Delete `src/data/tools.ts` and `src/data/catalog.ts` (keep `src/data/learnTasks.ts` — that's a different system).

### Phase 2 — Blog fix (SERVICE_ROLE_KEY error)
- The error means a client-reachable module is importing `client.server`. I'll trace `blog.index.tsx` and `blog.$slug.tsx` and move all DB access into `createServerFn` handlers with `await import("@/integrations/supabase/client.server")` inside the handler body.
- Verify RLS on `blog_posts` allows public read of `published = true` rows; tighten if needed.

### Phase 3 — Prompts fix
- Audit `listPrompts()` in `src/lib/content.functions.ts`. Likely the query filters by `published`/RLS in a way that hides rows. Switch list to public server fn + admin read with safe projection.
- Replace any hardcoded "500+" copy with a dynamic count from the query result.

### Phase 4 — Slug consistency report
- Server script that pulls every slug from DB + every route param across the app + sitemap entries, produces `docs/SLUG_AUDIT.md` listing duplicates, mismatches, orphans.

### Phase 5 — Categories/subcategories dynamic
- Folded into Phase 1.

### Phase 6 — SEO cleanup
- Global find-and-replace across `src/**`, `public/**`, `docs/**`:
  - `NeuroHub` → `AIBlaze`
  - `Amplify AI` → `AIBlaze`
  - `amplify-ai-path.lovable.app` → `aiblaze.io`
  - any remaining `*.lovable.app` canonical/OG → `aiblaze.io`
- Update every route `head()`, `__root.tsx` Organization/WebSite JSON-LD, footer, header logo, legal pages.

### Phase 7 — Dynamic sitemap on aiblaze.io
- Rewrite `src/routes/sitemap[.]xml.ts` to drop the static catalog import and pull 100% from Supabase, with `BASE_URL = "https://aiblaze.io"`. Filter `published = true` for blog. Generate lastmod from `updated_at`.

### Phase 8 — Branding cleanup
- Same sweep as Phase 6 + header logo text, footer copy, `index.html` `<title>` if any, `public/robots.txt` sitemap line.

### Phase 9 — Favicon & logo
- Generate AIBlaze favicon (flame icon, brand color) at 32×32, 192×192, 512×512, apple-touch-icon, and ICO. Wire into `__root.tsx` `links`. Add `manifest.json`.

### Phase 10 — Validation
- Build, then hit each major route via `stack_modern--invoke-server-function`: `/`, `/browse`, `/prompts`, `/blog`, `/ranking`, `/sitemap.xml`, a known `/tool/<slug>`, `/category/<slug>`, `/blog/<slug>`. Report status codes.
- Run `supabase--linter` to catch RLS regressions.
- Produce `docs/LAUNCH_AUDIT.md` summarising files changed, tables hit, remaining issues.

### Phase 11 — Dashboard & production
- Verify `/admin` routes are gated by `_authenticated` + `has_role('admin')`.
- Smoke-test each CRUD page locally by invoking the underlying server fn with a fake admin session — or, more realistically, document the test steps for you to run after deploy since I can't sign in as you.
- Document deployment env-var checklist in `docs/DEPLOYMENT.md`.

## What I will NOT do without your sign-off
- Delete the static data files (Phase 1) until you confirm the Supabase catalog is populated (see Q3).
- Connect the `aiblaze.io` domain — that requires you to add DNS records in your registrar and click "Add custom domain" in Lovable.

## Rough size
~30-40 files edited, 1 migration (only if RLS needs tightening), 1 large data sync. Realistic execution time across multiple turns.

---

**Please answer the 4 questions above** (especially Q2 and Q3) and I'll start with Phase 1 immediately.