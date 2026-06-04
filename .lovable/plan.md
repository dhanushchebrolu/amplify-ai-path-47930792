
# Launch-Day Polish Plan

You're launching today — here's everything I'll do, grouped so you can see what changes where.

---

## 1. SEO — every public page

Right now only the root route sets a generic title/description. I'll add per-route `head()` metadata to every public page with unique titles, descriptions, keywords (including long-tail), Open Graph, Twitter card, and canonical URLs.

Routes that get full SEO metadata:
- `/` (home) — "NeuroHub — Every AI Tool in One Platform | Discover, Compare & Learn AI"
- `/browse` — "Browse 500+ AI Tools by Category — NeuroHub"
- `/prompts` + `/prompts/$id` (dynamic from prompt title)
- `/blog` + `/blog/$slug` (dynamic from post title + excerpt + cover)
- `/ranking` — "Top Ranked AI Tools 2026 — NeuroHub Rankings"
- `/category/$slug` + `/category/$slug/$sub` (dynamic from category name)
- `/tool/$slug` (dynamic from tool name + description)
- `/learn/spin`, `/learn/scratch`, `/learn/swipe`, `/learn/task/$id`
- `/howto/$category/$sub/$tool` (dynamic step-by-step)
- `/books`, `/courses`, `/search`

For each route I'll add:
- `<title>` (under 60 chars, keyword + brand)
- `<meta name="description">` (under 160 chars)
- `<meta name="keywords">` with long-tail keywords like "best free AI image generator 2026", "how to use ChatGPT for writing", "AI tools for students", "compare AI video generators", etc.
- `og:title`, `og:description`, `og:image` (when a cover exists), `og:url`, `og:type`
- `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`
- `<link rel="canonical">` on leaf routes only (avoids the TanStack duplicate-canonical bug)
- JSON-LD structured data: `Organization` + `WebSite` on root, `Article` on blog posts, `Product`/`SoftwareApplication` on tool pages, `BreadcrumbList` on category/tool pages, `FAQPage` where applicable
- `<html lang="en">` already present ✓
- Single H1 per page (audit & fix where missing)
- `alt` text on all images (audit & fix)

I'll also fix `public/robots.txt` to reference the sitemap.

---

## 2. Sitemap.xml — SEO-optimized, dynamic

The current `src/routes/sitemap[.]xml.ts` only reads the static catalog. I'll rewrite it to:
- Pull live data from Supabase (categories, subcategories, tools, prompts, blog posts, learn tasks)
- Include every public route with proper `<lastmod>`, `<changefreq>`, `<priority>`
- Use absolute URLs (`https://amplify-ai-path.lovable.app`)
- Be served at `/sitemap.xml`

You'll also get a downloadable static snapshot saved to `/mnt/documents/sitemap.xml` for your records.

---

## 3. Site speed

- **Code-splitting**: heavy admin routes and InfiniteMenu already lazy-load by route, but I'll verify and lazy-load the WebGL InfiniteMenu component on the home page (it pulls a 3D lib).
- **Image optimization**: add `loading="lazy"` and `decoding="async"` to non-LCP images across ToolCard, CatalogToolCard, blog cards, CategoryBentoCard. Add explicit `width`/`height` to prevent CLS.
- **Font preload**: add `<link rel="preconnect">` for fonts.gstatic.com (already there ✓), add `font-display: swap` (Google Fonts URL already uses it ✓), preload the LCP font weight.
- **LCP preload**: preload the home-page hero image.
- **Defer non-critical CSS**: keep critical above-the-fold styles inline via Tailwind, defer the rest.
- **Cache headers**: confirm sitemap and static assets have `Cache-Control: public, max-age=3600`.
- **Remove unused deps**: audit `package.json` for anything not used.
- **React Query staleTime**: bump default `staleTime` to 60s on listing queries (browse, prompts list, blog list) so navigation between pages doesn't refetch.

---

## 4. Footer — full legal/policy + contact

Replace the current minimal `SiteFooter` in `src/components/SiteChrome.tsx` with a proper multi-column footer:
- **Column 1**: NeuroHub logo + tagline + email `aiblaze.io@gmail.com`
- **Column 2 — Explore**: Home, Browse, Prompts, Blog, Ranking, Learn
- **Column 3 — Legal**: Privacy Policy, Terms of Service, Cookie Policy, Disclaimer, DMCA
- **Column 4 — Company**: About, Contact, Report a Bug, Sitemap
- Bottom strip: `© 2026 NeuroHub · All rights reserved · aiblaze.io@gmail.com`

I'll create real legal pages (not stubs) at:
- `/privacy` — Privacy Policy (data we collect, cookies, third-party services, GDPR/CCPA rights, contact email)
- `/terms` — Terms of Service (use, accounts, content, liability, governing law)
- `/cookies` — Cookie Policy
- `/disclaimer` — AI content disclaimer + affiliate disclaimer
- `/dmca` — DMCA takedown procedure with the email
- `/about` — About NeuroHub
- `/contact` — Contact form (sends to your email via a server function) + the email visible

All legal pages will have their own SEO metadata.

---

## 5. Report a Bug

- New floating "Report a bug" button (bottom-right, all pages) + footer link
- Opens a dialog form: Title, Description, Page URL (auto-filled), Severity, Email (optional)
- New table `bug_reports` (id, title, description, page_url, severity, reporter_email, status [new/in_progress/resolved], created_at, updated_at)
- RLS: anyone can insert (public reporting); only admins can read/update/delete
- New admin page `/admin/bug-reports` with list, filter by status, mark resolved, delete
- Add nav item in the admin sidebar
- Counter shown on admin dashboard overview

---

## 6. Backup strategy

I'll create `docs/BACKUP_AND_RESTORE.md` covering:

**GitHub (code backup)**
- Step-by-step to connect this Lovable project to GitHub via the + menu → GitHub → Connect project
- How the two-way sync works
- How to clone, branch, and restore from any commit

**Database (Supabase)**
- A scheduled job (`pg_cron` daily at 03:00 UTC) that runs `pg_dump`-equivalent exports via a server route `/api/public/hooks/backup-db` and writes JSON exports of every table to the `content-images` storage bucket under `backups/YYYY-MM-DD/`
- Manual export instructions (Cloud → Database → Tables → Export CSV per table)
- Point-in-time recovery note (Supabase keeps automatic backups; how to request restore)

**Uploaded assets (storage)**
- Storage bucket `content-images` is durable by default
- The daily backup job also writes a manifest of all object keys to `backups/YYYY-MM-DD/storage-manifest.json` so you can verify recoverability

**Restore process**
- Code restore: `git checkout <commit>` + push triggers Lovable sync
- DB restore: download backup JSON from storage → run import script (I'll include `scripts/restore-db.ts`)
- Asset restore: re-upload from manifest

---

## 7. Deliverables checklist

- [ ] Per-route `head()` on every public route with title, description, keywords, OG, Twitter, canonical, JSON-LD
- [ ] Dynamic sitemap.xml from Supabase + downloadable snapshot in `/mnt/documents/sitemap.xml`
- [ ] Updated `robots.txt` with sitemap reference
- [ ] Image lazy-loading + width/height + LCP preload
- [ ] Lazy-load InfiniteMenu WebGL component
- [ ] React Query staleTime tuning
- [ ] Full footer with 4 columns + email + bottom strip
- [ ] Legal pages: privacy, terms, cookies, disclaimer, dmca, about, contact
- [ ] Contact form server function → emails `aiblaze.io@gmail.com`
- [ ] Floating "Report a bug" button + dialog form
- [ ] `bug_reports` table + RLS + admin page + nav item
- [ ] Daily DB backup cron job + storage manifest
- [ ] `docs/BACKUP_AND_RESTORE.md`
- [ ] `scripts/restore-db.ts`

---

## Quick clarifications before I build

1. **Contact / bug-report emails to `aiblaze.io@gmail.com`** — do you want me to set up Lovable's built-in email sending (uses your own sender domain, best deliverability), or just store submissions in the database and you'll check the admin dashboard? Email setup adds ~5 min and a DNS step on your domain.

2. **Legal pages** — generic-but-solid template content tailored to NeuroHub (an AI tool directory) is what I'll write. If you have a company name / country of incorporation for the "governing law" clause, tell me; otherwise I'll use "United States" as a neutral default and you can edit later.

3. **Sitemap base URL** — I'll use `https://amplify-ai-path.lovable.app` (your current Lovable preview domain). If you have a custom domain ready, paste it and I'll bake that in instead.

If you're good with the defaults (DB-only bug reports + DB-only contact form, US governing law, current Lovable domain), just reply "go" and I'll implement everything.
