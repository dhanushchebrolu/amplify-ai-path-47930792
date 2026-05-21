import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { categories, tools, trendingTools } from "@/data/tools";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { CategoryBentoCard } from "@/components/CategoryBentoCard";
import { ToolCard } from "@/components/ToolCard";
import { Search, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NeuroHub — Every AI tool in one platform" },
      { name: "description", content: "Discover, compare, and access the best AI tools for writing, video, audio, image, coding, and productivity. 164+ tools, updated daily." },
      { property: "og:title", content: "NeuroHub — Every AI tool in one platform" },
      { property: "og:description", content: "Discover, compare, and access the best AI tools. 164+ tools, updated daily." },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});

function Home() {
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const trending = trendingTools();

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    navigate({ to: "/browse", search: { q: q || undefined } });
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      {/* Hero */}
      <section className="relative">
        <div className="hero-glow absolute inset-0 pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-6 pt-24 pb-12 text-center">
          <div className="inline-flex items-center gap-2 text-xs text-muted-foreground mb-8">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{tools.length}+ AI Tools · Updated Daily</span>
          </div>
          <h1 className="font-display text-6xl md:text-8xl leading-[1.02] tracking-tight">
            Every AI Tool in
            <br />
            <em style={{ color: "var(--serif-italic-color)" }}>one Platform</em>
          </h1>
          <p className="mt-7 text-muted-foreground max-w-md mx-auto">
            Find the perfect AI product for your needs, all in one place.
          </p>

          <form
            onSubmit={submitSearch}
            className="mt-10 mx-auto max-w-xl flex items-center gap-1 p-1.5 rounded-full bg-white/[0.04] border border-white/10 focus-within:border-white/25 transition-colors"
          >
            <Search className="w-4 h-4 text-muted-foreground ml-4" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="I'm looking for..."
              className="flex-1 bg-transparent outline-none px-3 py-2 text-sm placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              className="bg-primary text-primary-foreground rounded-full px-5 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Category Bento */}
      <section className="w-full mx-auto max-w-7xl px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-7">
          {categories.slice(0, 4).map((c) => (
            <CategoryBentoCard key={c.slug} category={c} />
          ))}
        </div>

        <div className="mt-7 grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-7">
          {categories.slice(4).map((c) => (
            <CategoryBentoCard key={c.slug} category={c} />
          ))}
        </div>
      </section>

      {/* Trending */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
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
