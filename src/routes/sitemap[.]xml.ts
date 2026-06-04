import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { catalog } from "@/data/catalog";
import { tools as staticTools } from "@/data/tools";

const BASE_URL = "https://amplify-ai-path.lovable.app";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

async function fetchDbEntries(): Promise<SitemapEntry[]> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return [];
  const out: SitemapEntry[] = [];
  const headers = { apikey: key, Authorization: `Bearer ${key}` };
  try {
    const [blog, prompts, dbTools] = await Promise.all([
      fetch(`${url}/rest/v1/blog_posts?select=slug,updated_at&published=eq.true`, { headers }).then(r => r.ok ? r.json() : []),
      fetch(`${url}/rest/v1/prompts?select=id,updated_at`, { headers }).then(r => r.ok ? r.json() : []),
      fetch(`${url}/rest/v1/tools?select=slug,updated_at`, { headers }).then(r => r.ok ? r.json() : []),
    ]);
    for (const p of blog ?? []) out.push({ path: `/blog/${p.slug}`, lastmod: p.updated_at?.slice(0, 10), changefreq: "weekly", priority: "0.7" });
    for (const p of prompts ?? []) out.push({ path: `/prompts/${p.id}`, lastmod: p.updated_at?.slice(0, 10), changefreq: "monthly", priority: "0.6" });
    for (const t of dbTools ?? []) out.push({ path: `/tool/${t.slug}`, lastmod: t.updated_at?.slice(0, 10), changefreq: "weekly", priority: "0.6" });
  } catch {
    /* ignore — sitemap should still render from static catalog */
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

        for (const c of catalog) {
          entries.push({ path: `/category/${c.slug}`, changefreq: "weekly", priority: "0.8" });
          for (const s of c.subs) {
            entries.push({ path: `/category/${c.slug}/${s.slug}`, changefreq: "weekly", priority: "0.7" });
          }
        }
        for (const t of staticTools) {
          entries.push({ path: `/tool/${t.slug}`, changefreq: "weekly", priority: "0.6" });
        }

        const dbEntries = await fetchDbEntries();
        for (const e of dbEntries) entries.push(e);

        // De-duplicate by path
        const seen = new Set<string>();
        const unique = entries.filter((e) => (seen.has(e.path) ? false : (seen.add(e.path), true)));

        const urls = unique.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ].filter(Boolean).join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
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
