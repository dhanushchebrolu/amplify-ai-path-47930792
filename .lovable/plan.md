## Goal

A single-admin dashboard at `/admin` where you can create, edit, and delete every piece of content on the site (tools, prompts, learning tasks, categories/subcategories). Public visitors continue browsing without any login.

## 1. Enable Lovable Cloud

Provisions Postgres + Auth so we can store editable content and gate the dashboard. The rest of the site stays public — no login wall for visitors.

## 2. Database schema (migration)

Tables in `public`:

- `categories` — `id, slug, name, description, sort_order, created_at`
- `subcategories` — `id, category_id (fk), slug, name, description, sort_order`
- `tools` — `id, subcategory_id (fk), slug, name, tagline, description, url, logo_url, tags[], featured, sort_order`
- `prompts` — `id, title, body, category, tags[], sort_order`
- `learn_tasks` — `id, kind ('spin'|'swipe'|'scratch'), title, summary, body, cover_image, reference_image, sort_order`
- `app_role` enum (`admin`) + `user_roles (id, user_id, role)` table
- `has_role(uuid, app_role)` SECURITY DEFINER function

RLS:
- **Public SELECT** on all content tables (anon + authenticated) — site stays loginless.
- **INSERT/UPDATE/DELETE** restricted to `has_role(auth.uid(),'admin')`.
- `user_roles`: select for authenticated, all for admins.
- Trigger on `auth.users` insert: if no admin exists yet, grant the new user the `admin` role (first signup = admin). All later signups get nothing.

GRANTs: `SELECT` to `anon, authenticated`; `ALL` to `service_role`; write privileges to `authenticated` (RLS still enforces admin-only).

## 3. Seed existing content

A one-shot SQL seed migration copies every entry from `src/data/tools.ts`, `src/data/learnTasks.ts`, and the prompts/categories static files into the new tables so nothing is lost.

## 4. Server functions (read paths)

`src/lib/content.functions.ts` — public read fns (`listCategories`, `listToolsBySubcategory`, `getTool`, `listPrompts`, `listLearnTasks`, etc.) using `supabaseAdmin` scoped by safe filters. Public pages switch from importing static data to calling these via TanStack Query.

## 5. Admin auth

- `/admin/login` — email/password + Google sign-in (via Lovable broker + `supabase--configure_social_auth google`).
- `_admin` pathless layout: `beforeLoad` calls a `requireAdmin` server fn that throws redirect if user isn't authenticated or doesn't have the admin role.
- `attachSupabaseAuth` registered in `src/start.ts`.

## 6. Admin dashboard UI (`/admin/*`)

Routes under `src/routes/_admin/admin/`:
- `index` — overview with counts + quick links
- `tools` — list/search/edit/delete + "New tool" dialog (form with all fields, image upload via URL for now)
- `prompts` — same pattern
- `learn-tasks` — same pattern, with kind selector (spin/swipe/scratch) and image fields
- `categories` — manage categories and nested subcategories

Each list uses a `DataTable` with inline edit dialog (`react-hook-form` + `zod`) and confirm-delete. Mutations go through `createServerFn` handlers with `requireSupabaseAuth` + admin check, then `queryClient.invalidateQueries` on success.

## 7. Wire public pages to the DB

Update `src/routes/index.tsx`, `browse.tsx`, `category.$slug.*`, `tool.$slug.tsx`, `prompts.tsx`, `learn.spin/swipe/scratch.tsx`, `learn.task.$id.tsx`, `ranking.tsx` to read from the new server fns instead of static data files. Keep the static `.ts` files as fallback during seeding then remove imports.

## 8. Notes

- First user to sign up at `/admin/login` becomes the sole admin. Tell you this clearly on the login page so you sign up immediately after deploy.
- Subsequent signups have no role and get redirected away from `/admin`.
- Images stay as URLs (paste a hot-linkable URL). Full file-upload storage can be added later if you want.

## Technical details

- `attachSupabaseAuth` appended to `functionMiddleware` in `src/start.ts`.
- `onAuthStateChange` listener in `__root.tsx` invalidates router + query cache.
- All write server fns: `.middleware([requireSupabaseAuth])` + inline admin-role check via `has_role` RPC.
- TanStack Query for all reads; loaders use `ensureQueryData`.
