import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { catalog, catalogTotalTools } from "@/data/catalog";
import { trendingTools } from "@/data/tools";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { BrowseCategoryChips, BrowseCategorySections } from "@/components/BrowseCategorySections";
import { ToolCard } from "@/components/ToolCard";
import { HeroClothesline } from "@/components/HeroClothesline";
import { HeroDecor } from "@/components/HeroDecor";
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

      <section className="hero-cosmic">
        <HeroDecor />
        <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 pt-14 sm:pt-24 text-center">
          <h1 className="hero-headline text-[3.1rem] leading-[0.98] sm:text-7xl lg:text-[6.1rem] lg:leading-[0.95] text-navy text-balance">
            Every AI Tool in <span className="text-gradient-brand pr-[0.04em]">one Platform</span>
          </h1>
          <p className="mt-5 sm:mt-6 text-base sm:text-xl text-[#475467] max-w-xl mx-auto text-balance">
            Explore, compare, and find the perfect AI product for your needs, all in one place.
          </p>

          <div className="mt-7 sm:mt-9 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 max-w-3xl mx-auto">
            <form
              onSubmit={submitSearch}
              role="search"
              className="flex-1 flex items-center gap-2 h-14 sm:h-16 pl-4 sm:pl-5 pr-1.5 sm:pr-2 rounded-2xl bg-white border border-white shadow-[0_2px_4px_rgb(16_24_40/0.04),0_16px_40px_-16px_rgb(60_70_160/0.35)] ring-1 ring-navy/[0.06] transition-[box-shadow] duration-200 focus-within:ring-2 focus-within:ring-brand/60"
            >
              <Search className="w-5 h-5 text-brand shrink-0" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={`Search ${total}+ AI tools...`}
                aria-label="Search AI tools"
                className="flex-1 min-w-0 bg-transparent outline-none px-1.5 text-[15px] sm:text-[17px] text-navy placeholder:text-[#667085]"
              />
              <button type="submit" className="btn-highlight shrink-0 h-11 sm:h-12 px-4 sm:px-5 rounded-xl text-[15px]">
                Search <Search className="w-4 h-4" />
              </button>
            </form>
            <Link
              to="/browse"
              className="inline-flex items-center justify-center gap-2.5 h-14 sm:h-16 px-7 rounded-2xl bg-navy text-white text-[15px] sm:text-base font-semibold shadow-[0_16px_32px_-14px_rgb(16_24_40/0.7)] hover:bg-[#1B2440] hover:-translate-y-0.5 transition-all"
            >
              Browse all tools
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        <div className="relative z-0 mt-2 pb-6">
          <HeroClothesline tools={trending} />
        </div>
      </section>

      <section id="browse" className="bg-background">
        <div className="w-full mx-auto max-w-[1400px] px-4 sm:px-6 pt-4 sm:pt-6 pb-16">
          <p className="text-base sm:text-lg text-muted-foreground">
            {total}+ curated tools across {catalog.length} categories. Pick a sub-category to dive deeper.
          </p>
          <BrowseCategoryChips categories={catalog} />
          <BrowseCategorySections categories={catalog} />
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
