import { readServerEnv } from "@/config/env.server";
import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { catalog } from "@/data/catalog";
import { getTask, learnTasks } from "@/data/learnTasks";

const BASE_URL = "https://aiblaze.io";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
  images?: string[];
}

function escXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

async function fetchDbEntries(): Promise<SitemapEntry[]> {
  const { env: cfg } = readServerEnv();
  const url = cfg.SUPABASE_URL;
  const key = cfg.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return [];
  const out: SitemapEntry[] = [];
  const headers = { apikey: key, Authorization: `Bearer ${key}` };
  const fetchAll = async (path: string) => {
    const rows: any[] = [];
    let from = 0;
    const pageSize = 1000;
    while (true) {
      // A network failure is treated like a non-OK response so the
      // catalog-derived entries below are still emitted.
      const res = await fetch(`${url}${path}`, {
        headers: { ...headers, Range: `${from}-${from + pageSize - 1}` },
      }).catch(() => null);
      if (!res?.ok) break;
      const batch = await res.json();
      rows.push(...batch);
      if (!batch.length || batch.length < pageSize) break;
      from += pageSize;
    }
    return rows;
  };

  try {
    const [categories, subcategories, tools, blog, prompts, learnRows, comparisons] = await Promise.all([
      fetchAll(`/rest/v1/categories?select=slug,updated_at,icon_url`),
      fetchAll(`/rest/v1/subcategories?select=category_slug,slug,updated_at,icon_url`),
      fetchAll(`/rest/v1/tools?select=slug,updated_at,logo_url,featured,sort_order,noindex&order=featured.desc,sort_order.asc`),
      fetchAll(`/rest/v1/blog_posts?select=slug,updated_at,cover_url,noindex&published=eq.true`),
      fetchAll(`/rest/v1/prompts?select=id,updated_at`),
      fetchAll(`/rest/v1/learn_tasks?select=slug,updated_at`),
      fetchAll(`/rest/v1/tool_comparison_data?select=tool_id,updated_at,status,tools:tool_id(slug)&status=eq.published`),
    ]);


    // /category routes resolve against the static catalog, so emit catalog
    // slugs (DB rows only contribute lastmod/images when their slug matches).
    const catRows = new Map(categories.filter((c) => c.slug).map((c) => [c.slug, c]));
    const subRows = new Map(
      subcategories
        .filter((s) => s.slug && s.category_slug)
        .map((s) => [`${s.category_slug}/${s.slug}`, s]),
    );
    for (const c of catalog) {
      const row = catRows.get(c.slug);
      out.push({
        path: `/category/${c.slug}`,
        lastmod: row?.updated_at?.slice(0, 10),
        changefreq: "weekly",
        priority: "0.8",
        images: row?.icon_url ? [row.icon_url] : undefined,
      });
      for (const sub of c.subs) {
        const subRow = subRows.get(`${c.slug}/${sub.slug}`);
        out.push({
          path: `/category/${c.slug}/${sub.slug}`,
          lastmod: subRow?.updated_at?.slice(0, 10),
          changefreq: "weekly",
          priority: "0.7",
          images: subRow?.icon_url ? [subRow.icon_url] : undefined,
        });
      }
    }
    for (const t of tools) {
      if (!t.slug || t.noindex) continue;
      out.push({
        path: `/tool/${t.slug}`,
        lastmod: t.updated_at?.slice(0, 10),
        changefreq: "weekly",
        priority: "0.6",
        images: t.logo_url ? [t.logo_url] : undefined,
      });
    }
    for (const p of blog) {
      if (!p.slug || p.noindex) continue;
      out.push({
        path: `/blog/${p.slug}`,
        lastmod: p.updated_at?.slice(0, 10),
        changefreq: "weekly",
        priority: "0.7",
        images: p.cover_url ? [p.cover_url] : undefined,
      });
    }
    for (const p of prompts) {
      if (!p.id) continue;
      out.push({
        path: `/prompts/${p.id}`,
        lastmod: p.updated_at?.slice(0, 10),
        changefreq: "monthly",
        priority: "0.6",
      });
    }
    // /learn/task/$id only resolves static task ids; skip DB rows it can't serve.
    for (const l of learnRows) {
      if (!l.slug || !getTask(l.slug)) continue;
      out.push({
        path: `/learn/task/${l.slug}`,
        lastmod: l.updated_at?.slice(0, 10),
        changefreq: "monthly",
        priority: "0.5",
      });
    }

    // Compare pairs: pair the top N published-comparison tools alphabetically, cap 500
    const publishedSlugs = (comparisons ?? [])
      .map((r: any) => ({ slug: r.tools?.slug as string | undefined, updated_at: r.updated_at as string }))
      .filter((r: any): r is { slug: string; updated_at: string } => !!r.slug);
    const cap = 500;
    let added = 0;
    outer: for (let i = 0; i < publishedSlugs.length; i++) {
      for (let j = i + 1; j < publishedSlugs.length; j++) {
        const [a, b] = [publishedSlugs[i], publishedSlugs[j]];
        const pair = [a.slug, b.slug].sort((x, y) => x.localeCompare(y)).join("-vs-");
        out.push({
          path: `/compare/${pair}`,
          lastmod: (a.updated_at > b.updated_at ? a.updated_at : b.updated_at)?.slice(0, 10),
          changefreq: "weekly",
          priority: "0.6",
        });
        if (++added >= cap) break outer;
      }
    }
  } catch {
    /* ignore — static routes still ship */
  }

  return out;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const today = new Date().toISOString().slice(0, 10);
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "daily", priority: "1.0", lastmod: today },
          { path: "/browse", changefreq: "daily", priority: "0.9", lastmod: today },
          { path: "/compare", changefreq: "weekly", priority: "0.8", lastmod: today },

          { path: "/prompts", changefreq: "daily", priority: "0.9", lastmod: today },
          { path: "/blog", changefreq: "daily", priority: "0.9", lastmod: today },
          { path: "/ranking", changefreq: "weekly", priority: "0.8", lastmod: today },
          { path: "/learn/spin", changefreq: "weekly", priority: "0.7" },
          { path: "/learn/scratch", changefreq: "weekly", priority: "0.7" },
          { path: "/learn/swipe", changefreq: "weekly", priority: "0.7" },
          { path: "/books", changefreq: "monthly", priority: "0.5" },
          { path: "/courses", changefreq: "monthly", priority: "0.5" },
          { path: "/about", changefreq: "monthly", priority: "0.5" },
          { path: "/contact", changefreq: "monthly", priority: "0.5" },
          { path: "/privacy", changefreq: "yearly", priority: "0.3" },
          { path: "/terms", changefreq: "yearly", priority: "0.3" },
          { path: "/cookies", changefreq: "yearly", priority: "0.3" },
          { path: "/disclaimer", changefreq: "yearly", priority: "0.3" },
          { path: "/dmca", changefreq: "yearly", priority: "0.3" },
        ];

        const dbEntries = await fetchDbEntries();
        for (const e of dbEntries) entries.push(e);

        // Static learn tasks (served by /learn/task/$id) are always indexable.
        for (const t of learnTasks) {
          entries.push({ path: `/learn/task/${t.id}`, changefreq: "monthly", priority: "0.5" });
        }

        const seen = new Set<string>();
        const unique = entries.filter((e) => (seen.has(e.path) ? false : (seen.add(e.path), true)));

        const urls = unique.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            ...(e.images?.length
              ? e.images.map(
                  (img) =>
                    `    <image:image><image:loc>${escXml(img)}</image:loc></image:image>`,
                )
              : []),
            `  </url>`,
          ].filter(Boolean).join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
