import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { catalog, catalogTotalTools } from "@/data/catalog";
import { trendingTools } from "@/data/tools";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { BrowseCategoryChips } from "@/components/BrowseCategorySections";
import { CategoryPanel } from "@/components/CategoryPanel";
import { ToolCard } from "@/components/ToolCard";
import { ArrowRight, Search, Sparkles } from "lucide-react";

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

  const subTotal = useMemo(() => catalog.reduce((a, c) => a + c.subs.length, 0), []);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <section className="hero-glow overflow-hidden">
        <HeroShapes />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-14 sm:pt-24 pb-16 sm:pb-24 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand/15 bg-surface/80 backdrop-blur px-3 py-1.5 text-xs font-medium text-[#344054] shadow-[var(--shadow-card)] mb-7 sm:mb-9">
            <span className="grid place-items-center w-5 h-5 rounded-full bg-highlight text-navy">
              <Sparkles className="w-3 h-3" />
            </span>
            <span className="tabular-nums">{total}+ AI tools</span>
            <span className="text-border">|</span>
            <span className="tabular-nums">{catalog.length} categories</span>
          </div>
          <h1 className="font-display text-[2.6rem] leading-[1.06] sm:text-6xl md:text-7xl lg:text-[5.5rem] md:leading-[1.02] tracking-tight text-navy">
            Every AI Tool in
            <br />
            <em className="text-gradient-brand pr-[0.08em]">one Platform</em>
          </h1>
          <p className="mt-6 sm:mt-7 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto text-balance">
            Find the perfect AI product for your needs, all in one place.
          </p>

          <form
            onSubmit={submitSearch}
            role="search"
            className="mt-9 sm:mt-11 mx-auto w-full max-w-2xl flex items-center gap-2 p-2 rounded-xl bg-surface border border-navy/15 shadow-[0_1px_2px_rgb(16_24_40/0.06),0_18px_40px_-18px_rgb(16_24_40/0.35)] transition-[border-color,box-shadow] duration-200 focus-within:border-brand focus-within:shadow-[0_0_0_4px_rgb(56_103_255/0.14),0_0_0_7px_rgb(124_77_255/0.07),0_18px_40px_-18px_rgb(16_24_40/0.35)]"
          >
            <Search className="w-5 h-5 text-brand ml-2 sm:ml-3 shrink-0" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="I'm looking for..."
              aria-label="Search AI tools"
              className="flex-1 min-w-0 bg-transparent outline-none px-1.5 sm:px-2 py-2.5 sm:py-3 text-[15px] sm:text-base text-navy placeholder:text-muted-foreground"
            />
            <button type="submit" className="btn-highlight shrink-0 px-4 sm:px-6 py-2.5 sm:py-3 text-sm">
              Search
            </button>
          </form>

          <dl className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <HeroStat value={`${total}+`} label="tools" />
            <HeroStat value={String(catalog.length)} label="categories" />
            <HeroStat value={String(subTotal)} label="sub-categories" />
          </dl>
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

function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <dt className="sr-only">{label}</dt>
      <dd className="font-semibold text-navy tabular-nums">{value}</dd>
      <span aria-hidden>{label}</span>
    </div>
  );
}

/** Faint floating geometry behind the hero. Decorative only. */
function HeroShapes() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-0 max-w-7xl mx-auto">
      <svg className="hero-shape left-[6%] top-[18%] w-16 h-16 hidden sm:block text-brand/25" viewBox="0 0 64 64" fill="none" style={{ ["--r" as string]: "0deg" }}>
        <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="32" cy="32" r="3" fill="currentColor" />
      </svg>
      <svg className="hero-shape right-[8%] top-[14%] w-14 h-14 hidden sm:block text-violet-accent/25" viewBox="0 0 56 56" fill="none" style={{ ["--r" as string]: "18deg", animationDelay: "-3s" }}>
        <rect x="6" y="6" width="44" height="44" rx="10" stroke="currentColor" strokeWidth="1.5" />
      </svg>
      <svg className="hero-shape left-[14%] bottom-[16%] w-10 h-10 hidden md:block text-violet-accent/30" viewBox="0 0 40 40" fill="none" style={{ ["--r" as string]: "-12deg", animationDelay: "-5s" }}>
        <path d="M20 4 36 34H4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
      <svg className="hero-shape right-[15%] bottom-[20%] w-8 h-8 hidden sm:block text-brand/30" viewBox="0 0 32 32" fill="none" style={{ animationDelay: "-2s" }}>
        <path d="M16 4v24M4 16h24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <span className="hero-shape right-[24%] top-[30%] hidden lg:block w-2.5 h-2.5 rounded-full bg-highlight" style={{ animationDelay: "-6s" }} />
    </div>
  );
}
