import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { categories, tools } from "@/data/tools";

const BASE_URL = "";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const paths = [
          { path: "/", priority: "1.0", changefreq: "weekly" },
          { path: "/browse", priority: "0.9", changefreq: "daily" },
          ...categories.map((c) => ({
            path: `/category/${c.slug}`, priority: "0.8", changefreq: "weekly",
          })),
          ...tools.map((t) => ({
            path: `/tool/${t.slug}`, priority: "0.7", changefreq: "weekly",
          })),
        ];
        const urls = paths.map(
          (p) =>
            `  <url><loc>${BASE_URL}${p.path}</loc><changefreq>${p.changefreq}</changefreq><priority>${p.priority}</priority></url>`,
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
