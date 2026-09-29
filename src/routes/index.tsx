import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { catalog, catalogTotalTools } from "@/data/catalog";
import { trendingTools } from "@/data/tools";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { BrowseCategoryChips, BrowseCategorySections } from "@/components/BrowseCategorySections";
import { ToolCard } from "@/components/ToolCard";
import { Search, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Best AI Tools Directory 2026 | 1900+ AI Tools, Prompts & Resources - AI Blaze" },
      { name: "description", content: "Explore 1900+ AI tools, AI apps, and AI prompts. Compare the best AI tools for content creation, coding, marketing, design, automation, productivity, and business." },
      { property: "og:title", content: "Best AI Tools Directory 2026 | 1900+ AI Tools, Prompts & Resources - AI Blaze" },
      { property: "og:description", content: "Explore 1900+ AI tools, AI apps, and AI prompts. Compare the best AI tools for content creation, coding, marketing, design, automation, productivity, and business." },
      { property: "og:url", content: "https://aiblaze.io/" },
      { name: "twitter:title", content: "Best AI Tools Directory 2026 | 1900+ AI Tools, Prompts & Resources - AI Blaze" },
      { name: "twitter:description", content: "Explore 1900+ AI tools, AI apps, and AI prompts. Compare the best AI tools for content creation, coding, marketing, design, automation, productivity, and business." },
    ],
    links: [{ rel: "canonical", href: "https://aiblaze.io/" }],
  }),
  component: Home,
});

function Home() {
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const trending = trendingTools();
  const total = useMemo(catalogTotalTools, []);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    navigate({ to: "/search", search: { q: q.trim() } });
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <section className="relative">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-16 sm:pt-24 pb-12 text-center">
          <div className="inline-flex items-center gap-2 text-xs text-muted-foreground mb-8">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{total}+ AI Tools · {catalog.length} Categories</span>
          </div>
          <h1 className="font-display text-5xl sm:text-6xl md:text-8xl leading-[1.05] md:leading-[1.02] tracking-tight">
            Every AI Tool in
            <br />
            <em style={{ color: "var(--serif-italic-color)" }}>one Platform</em>
          </h1>
          <p className="mt-7 text-muted-foreground max-w-md mx-auto">
            Find the perfect AI product for your needs, all in one place.
          </p>

          <form
            onSubmit={submitSearch}
            className="mt-10 mx-auto w-full max-w-xl flex items-center gap-1 p-1.5 rounded-full bg-foreground/[0.04] border border-foreground/10 focus-within:border-foreground/25 transition-colors"
          >
            <Search className="w-4 h-4 text-muted-foreground ml-3 sm:ml-4 shrink-0" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="I'm looking for..."
              className="flex-1 min-w-0 bg-transparent outline-none px-2 sm:px-3 py-2 text-sm placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              className="shrink-0 bg-primary text-primary-foreground rounded-full px-4 sm:px-5 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      <section id="browse" className="w-full mx-auto max-w-7xl px-6 pb-10 pt-4">
        <div className="flex items-end justify-between flex-wrap gap-3">
          <div>
            <h2 className="font-display text-3xl md:text-4xl">Browse AI tools by category</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {total}+ curated tools across {catalog.length} categories. Pick a sub-category to dive deeper.
            </p>
          </div>
          <Link
            to="/browse"
            className="inline-flex items-center gap-2 text-sm font-medium bg-foreground/[0.06] hover:bg-foreground/[0.12] border border-foreground/10 rounded-full px-5 py-2.5 transition-colors"
          >
            Explore all {catalog.length} categories →
          </Link>
        </div>

        <BrowseCategoryChips categories={catalog} />
        <BrowseCategorySections categories={catalog} />
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24 pt-10">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="font-display text-3xl md:text-4xl">Trending right now</h2>
            <p className="text-sm text-muted-foreground mt-1">
              The tools our community can't stop using this week.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trending.map((t) => (
            <ToolCard key={t.slug} tool={t} />
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
