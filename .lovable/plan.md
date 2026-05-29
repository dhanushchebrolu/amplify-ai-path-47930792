## Goal

Extend the admin dashboard with full content management for categories, blog, books, and courses (with affiliate links), add image fields to prompts, and surface Books/Courses in the public navbar.

## 1. Database (single migration)

New tables in `public` (all with public SELECT, admin-only write via `has_role(auth.uid(),'admin')`, GRANTs to anon/authenticated/service_role):

- `categories` — `id, slug (unique), name, description, sort_order, created_at, updated_at`
- `subcategories` — `id, category_slug, slug, name, description, sort_order, created_at, updated_at` (unique on `category_slug, slug`)
- `blog_posts` — `id, slug (unique), title, excerpt, body (markdown), cover_url, tags[], published (bool), published_at, sort_order, created_at, updated_at`
- `books` — `id, slug, title, author, description, cover_url, affiliate_url, price_label, tags[], sort_order, featured, created_at, updated_at`
- `courses` — `id, slug, title, provider, description, cover_url, affiliate_url, price_label, level, duration, tags[], sort_order, featured, created_at, updated_at`

Add to existing `prompts`: `image_url text` (the screenshot/sample image shown above the prompt body — the red-box area).

Seed categories/subcategories from the existing static data so the admin sees them populated.

## 2. Server functions (`src/lib/content.functions.ts`)

Add list/upsert/delete fns for: categories, subcategories, blog posts, books, courses. Same pattern as existing tools/prompts (admin-gated writes, public reads).

## 3. Admin UI

New routes under `_admin/admin/`:
- `categories` — list + CRUD; expandable rows showing subcategories with inline add/edit/delete
- `blog` — list + CRUD with markdown textarea, cover image URL, published toggle
- `books` — list + CRUD (title, author, cover, affiliate URL, price)
- `courses` — list + CRUD (title, provider, cover, affiliate URL, level, duration, price)

Extend existing `prompts` admin to include `image_url` field.

**Image upload**: add a Supabase Storage bucket `content-images` (public read, admin write). Build a small `<ImageField>` component that lets the admin either paste a URL or upload a file (uploads via the browser supabase client; RLS on storage allows only admins). Use it in prompts, blog, books, courses, tools, learn-tasks forms.

Update `_admin.tsx` sidebar to include: Overview, Tools, Prompts, Learn tasks, Categories, Blog, Books, Courses.

## 4. Public pages

- Add `/blog` (list) and `/blog/$slug` (post) routes reading from `blog_posts` where `published = true`.
- Add `/books` and `/courses` routes — card grids with affiliate "Get it" buttons (`rel="sponsored noopener"`).
- Update `prompts.tsx` to render `image_url` above the prompt body when present (the red-box area).
- Add **Books** and **Courses** links to the navbar (`SiteChrome.tsx`).
- Wire **categories/subcategories** on `/browse` and `/category/$slug` to read from DB instead of static data (existing tools already DB-backed).

## 5. Out of scope (ask before doing)

- Rich-text/WYSIWYG blog editor — using markdown textarea for now.
- Multi-image galleries per blog post — single cover only.
- Affiliate click tracking / analytics.

## Technical details

- Storage bucket created via migration with policies: `SELECT` for anon (public CDN URLs), `INSERT/UPDATE/DELETE` only when `has_role(auth.uid(),'admin')`.
- `ImageField` uploads to `content-images/{kind}/{uuid}.{ext}` and writes the resulting public URL into the form field.
- All new public list pages use TanStack Query + `ensureQueryData` in the loader, `useSuspenseQuery` in the component.
- Add `errorComponent` + `notFoundComponent` to every new route with a loader.
