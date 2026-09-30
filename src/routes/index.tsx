import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { catalog, catalogTotalTools } from "@/data/catalog";
import { trendingTools } from "@/data/tools";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { BrowseCategoryChips } from "@/components/BrowseCategorySections";
import { CategoryPanel } from "@/components/CategoryPanel";
import { ToolCard } from "@/components/ToolCard";
import { HeroClothesline } from "@/components/HeroClothesline";
import { ArrowRight, Search } from "lucide-react";

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

      <section className="px-2 sm:px-4 pt-3 sm:pt-4">
        <div className="hero-panel mx-auto max-w-[1440px]">
          <div className="relative mx-auto max-w-4xl px-4 sm:px-6 pt-12 sm:pt-20 text-center">
            <h1 className="font-condensed font-semibold text-[3rem] leading-[0.98] sm:text-7xl lg:text-[5.75rem] tracking-[-0.01em] text-navy text-balance">
              Every AI Tool in <span className="text-gradient-brand">one Platform</span>
            </h1>
            <p className="mt-4 sm:mt-5 text-base sm:text-lg text-[#475467] max-w-md mx-auto text-balance">
              Explore, compare, and find the perfect AI product for your needs, all in one place.
            </p>

            <div className="mt-7 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 max-w-xl mx-auto">
              <form
                onSubmit={submitSearch}
                role="search"
                className="flex-1 flex items-center gap-1 h-12 pl-3.5 pr-1.5 rounded-xl bg-surface border border-navy/15 shadow-[0_1px_2px_rgb(16_24_40/0.06),0_10px_24px_-14px_rgb(16_24_40/0.3)] transition-[border-color,box-shadow] duration-200 focus-within:border-brand focus-within:shadow-[0_0_0_4px_rgb(56_103_255/0.14),0_10px_24px_-14px_rgb(16_24_40/0.3)]"
              >
                <Search className="w-4 h-4 text-brand shrink-0" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={`Search ${total}+ AI tools...`}
                  aria-label="Search AI tools"
                  className="flex-1 min-w-0 bg-transparent outline-none px-2 text-[15px] text-navy placeholder:text-muted-foreground"
                />
                <button type="submit" className="btn-highlight shrink-0 h-9 px-3.5 text-sm">
                  Search
                </button>
              </form>
              <Link
                to="/browse"
                className="inline-flex items-center justify-center gap-2 h-12 px-5 rounded-xl bg-navy text-white text-sm font-semibold shadow-[0_10px_24px_-12px_rgb(16_24_40/0.6)] hover:bg-brand-dark hover:-translate-y-0.5 transition-all"
              >
                Browse all tools
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="mt-4 sm:mt-5 pb-2 sm:pb-4">
            <HeroClothesline tools={trending} />
          </div>
        </div>
      </section>

      <section id="browse" className="section-surface section-rule">
        <div className="w-full mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20">
          <div className="flex items-end justify-between flex-wrap gap-5">
            <div className="max-w-2xl">
              <span className="eyebrow">Explore the directory</span>
              <h2 className="mt-3 font-display text-[2rem] sm:text-4xl md:text-5xl leading-[1.08] text-navy">
                Browse AI tools by category
              </h2>
              <p className="mt-3 text-muted-foreground">
                {total}+ curated tools across {catalog.length} categories. Pick a sub-category to dive deeper.
              </p>
            </div>
            <Link to="/browse" className="btn-secondary group">
              Explore all {catalog.length} categories
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <BrowseCategoryChips categories={catalog} />

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
            {catalog.map((c) => (
              <CategoryPanel key={c.slug} category={c} />
            ))}
          </div>
        </div>
      </section>

      <section className="section-tint section-rule">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
            <div>
              <span className="eyebrow">Trending this week</span>
              <h2 className="mt-3 font-display text-[2rem] sm:text-4xl md:text-5xl leading-[1.08] text-navy">Trending right now</h2>
              <p className="text-muted-foreground mt-3">
                The tools our community can't stop using this week.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {trending.map((t) => (
              <ToolCard key={t.slug} tool={t} />
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
