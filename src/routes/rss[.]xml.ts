// RSS 2.0 feed for the AI Blaze blog. Listed in <head> of __root.tsx and
// referenced from the sitemap; crawlable by Google News, feed readers and
// LLM ingestion pipelines.
import { readServerEnv } from "@/config/env.server";
import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const BASE_URL = "https://aiblaze.io";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

async function fetchPosts() {
  const { env: cfg } = readServerEnv();
  const url = cfg.SUPABASE_URL;
  const key = cfg.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return [];
  try {
    const res = await fetch(
      `${url}/rest/v1/blog_posts?select=slug,title,excerpt,published_at,updated_at,cover_url&published=eq.true&order=published_at.desc&limit=50`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` } },
    );
    if (!res.ok) return [];
    return (await res.json()) as Array<{
      slug: string;
      title: string;
      excerpt: string | null;
      published_at: string | null;
      updated_at: string | null;
      cover_url: string | null;
    }>;
  } catch {
    return [];
  }
}

export const Route = createFileRoute("/rss.xml")({
  server: {
    handlers: {
      GET: async () => {
        const posts = await fetchPosts();
        const lastBuild = new Date().toUTCString();

        const items = posts
          .map((p) => {
            const link = `${BASE_URL}/blog/${p.slug}`;
            const pub = p.published_at ? new Date(p.published_at).toUTCString() : lastBuild;
            return [
              `    <item>`,
              `      <title>${esc(p.title ?? "")}</title>`,
              `      <link>${link}</link>`,
              `      <guid isPermaLink="true">${link}</guid>`,
              `      <pubDate>${pub}</pubDate>`,
              p.excerpt ? `      <description>${esc(p.excerpt)}</description>` : null,
              p.cover_url ? `      <enclosure url="${esc(p.cover_url)}" type="image/jpeg" />` : null,
              `    </item>`,
            ]
              .filter(Boolean)
              .join("\n");
          })
          .join("\n");

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">`,
          `  <channel>`,
          `    <title>AI Blaze Blog</title>`,
          `    <link>${BASE_URL}/blog</link>`,
          `    <description>Expert reviews, comparisons and guides on the best AI tools, prompts and workflows.</description>`,
          `    <language>en-us</language>`,
          `    <lastBuildDate>${lastBuild}</lastBuildDate>`,
          `    <atom:link href="${BASE_URL}/rss.xml" rel="self" type="application/rss+xml" />`,
          items,
          `  </channel>`,
          `</rss>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/rss+xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
