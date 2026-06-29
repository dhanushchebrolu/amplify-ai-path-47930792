# Plan: HTML Blog CMS + Category SEO + Meta Update

This request spans three independent workstreams. I'll do them in order. Confirm or trim before I start.

---

## 1. Homepage meta (small, 1 edit)

Update `src/routes/index.tsx` `head()`:
- title → `Best AI Tools Directory 2026 | 1900+ AI Tools, Prompts & Resources - AI Blaze`
- description → `Explore 1900+ AI tools, AI apps, and AI prompts. Compare the best AI tools for content creation, coding, marketing, design, automation, productivity, and business.`
- Mirror into `og:title`, `og:description`, `twitter:title`, `twitter:description`.

---

## 2. Professional HTML blog editor (the big piece)

**Database**
- Add `content_html text` to `blog_posts` (keep existing `body` for back-compat).
- Add SEO columns: `seo_title`, `seo_description`, `focus_keyword`, `canonical_url`, `og_title`, `og_description`, `og_image`, `twitter_title`, `twitter_description`, `twitter_image` (all text, nullable).
- One-shot migration: for any post where `content_html` is null, copy `body` rendered to HTML via `marked` server-side so nothing breaks.

**Editor (`src/components/admin/HtmlEditor.tsx`)**
- Tiptap v2 + StarterKit, Underline, Link, Image, Table (+row/header/cell), TaskList/TaskItem, CodeBlockLowlight (highlight.js), Placeholder, TextAlign.
- Toolbar: H1-H6, B/I/U/S, inline code, bullet/numbered/task list, blockquote, hr, link (with "open in new tab"), image (URL), table insert/edit, code block, undo/redo.
- Three modes via tab strip: **Visual** | **Raw HTML** (textarea w/ basic monospace) | **Preview** (renders sanitized HTML in BlogContent renderer).
- Live counters: words, reading time, headings, images, tables.
- Paste from Word/Google Docs/ChatGPT preserved (Tiptap default paste handling + `Clipboard` from prosemirror).
- Sanitize on save with `isomorphic-dompurify`, allow-list per spec. Block `script`/`iframe`/`object`/`embed` + event-handler attrs.

**Wiring**
- `CrudPage` already supports field types. Add `type: "html"` that mounts `<HtmlEditor>`.
- In `_admin.admin.blog.tsx`, replace `body` markdown field with `content_html` html field + the new SEO field group.
- Server-side: `upsertBlogPost` runs sanitize before insert/update.

**Frontend rendering (`src/routes/blog.$slug.tsx`)**
- If `content_html` present → render via `<div className="blog-content" dangerouslySetInnerHTML={{__html: sanitized}} />` (sanitized server-side already, but re-sanitize defensively).
- Else fall back to existing `<BlogContent>` markdown renderer.
- Auto-add `id` slugs to h2/h3 server-side for anchor links / TOC.
- Apply `head()` overrides from SEO fields when present (seo_title, og_*, twitter_*).

**Auto Table of Contents**
- Server-side parse headings → small TOC component rendered above article (sticky on lg).

**Packages to add**: `@tiptap/react @tiptap/starter-kit @tiptap/extension-underline @tiptap/extension-link @tiptap/extension-image @tiptap/extension-table @tiptap/extension-table-row @tiptap/extension-table-header @tiptap/extension-table-cell @tiptap/extension-task-list @tiptap/extension-task-item @tiptap/extension-code-block-lowlight @tiptap/extension-placeholder @tiptap/extension-text-align lowlight isomorphic-dompurify`

---

## 3. Category & subcategory SEO content sections

**Already present** (no rebuild needed):
- `seo_content` table with `long_form` jsonb
- `SeoLongForm` component already renders intro, sections (H2 + paragraphs), buying guide, comparison table, FAQs (accordion), conclusion, related links — exactly what the spec describes.
- `scripts/generate-seo.ts` generates this via AI.

**Gaps to close**:
- Add **FAQ JSON-LD** automatically when `long_form.faqs` exists (currently only `structured_data` blob is used).
- Add **BreadcrumbList JSON-LD** on subcategory pages.
- Editable from dashboard: add a new admin route `_admin.admin.seo.tsx` (CRUD over `seo_content`) so non-CLI editing works.
- Add **"Generate SEO content"** button per row that calls a server fn wrapping the existing `generate-seo` logic (uses Lovable AI Gateway, no key needed).
- Tweak `SeoLongForm` to also output: "Benefits" bullet list, "Common use cases" bullet list, "How to choose" subsection — by mapping any section whose heading matches those keywords into `<ul>` when body lines start with `- `.

---

## Order of execution

1. Homepage meta (1 file).
2. DB migration: add columns.
3. Install Tiptap packages, build `HtmlEditor` + sanitizer.
4. Update blog admin + blog frontend renderer.
5. Add FAQ/Breadcrumb JSON-LD + admin SEO CRUD + Generate button.

## Out of scope (flag explicitly)

- I will **not** bulk-rewrite all existing blog posts to HTML beyond the one-shot markdown→HTML copy.
- I will **not** auto-generate SEO content for every existing category in one go — you'll trigger per row from the dashboard.

Reply **"go"** to execute, or tell me which sections to skip / change.
