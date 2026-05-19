import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getCategory, getTool, toolsByCategory, type Tool, type Category } from "@/data/tools";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { ToolLogo } from "@/components/ToolLogo";
import { ToolCard } from "@/components/ToolCard";
import { ArrowUpRight, Check, Star, X } from "lucide-react";

export const Route = createFileRoute("/tool/$slug")({
  loader: ({ params }): { tool: Tool; category: Category; alternatives: Tool[] } => {
    const tool = getTool(params.slug);
    if (!tool) throw notFound();
    const category = getCategory(tool.category)!;
    const alternatives = toolsByCategory(tool.category)
      .filter((t) => t.slug !== tool.slug)
      .slice(0, 3);
    return { tool, category, alternatives };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { tool } = loaderData;
    const title = `${tool.name} — ${tool.tagline} | NeuroHub`;
    const desc = tool.description;
    return {
      meta: [
        { title },
        { name: "description", content: desc.slice(0, 158) },
        { property: "og:title", content: title },
        { property: "og:description", content: desc.slice(0, 158) },
        { property: "og:url", content: `/tool/${tool.slug}` },
        { property: "og:type", content: "product" },
      ],
      links: [{ rel: "canonical", href: `/tool/${tool.slug}` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: tool.name,
            description: tool.description,
            applicationCategory: loaderData.category.name,
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: tool.rating,
              ratingCount: 100,
            },
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        },
      ],
    };
  },
  component: ToolPage,
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center">
      <p>Tool not found. <Link to="/" className="underline">Go home</Link></p>
    </div>
  ),
});

function ToolPage() {
  const { tool, category, alternatives } = Route.useLoaderData();

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 pt-10 pb-20 w-full">
        <div className="text-sm text-muted-foreground mb-6 flex items-center gap-1.5">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <span>/</span>
          <Link to="/category/$slug" params={{ slug: category.slug }} className="hover:text-foreground">
            {category.name}
          </Link>
          <span>/</span>
          <span className="text-foreground">{tool.name}</span>
        </div>

        {/* Header */}
        <div className="card-surface p-7 flex flex-col md:flex-row gap-6 md:items-center">
          <ToolLogo tool={tool} size={80} />
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-display text-4xl md:text-5xl">{tool.name}</h1>
              {tool.trending && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/20">
                  Trending
                </span>
              )}
            </div>
            <p className="mt-2 text-muted-foreground">{tool.tagline}</p>
            <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-primary text-primary" />
                {tool.rating.toFixed(1)}
              </span>
              <span>·</span>
              <span>{tool.priceFrom ?? tool.pricing}</span>
              <span>·</span>
              <Link
                to="/category/$slug"
                params={{ slug: category.slug }}
                className="hover:text-foreground"
              >
                {category.name}
              </Link>
            </div>
          </div>
          <a
            href={tool.website}
            target="_blank"
            rel="noopener sponsored"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-full px-5 py-3 font-medium text-sm hover:opacity-90 transition-opacity"
          >
            Visit {tool.name} <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>

        {/* About */}
        <section className="mt-10">
          <h2 className="font-display text-2xl mb-3">About {tool.name}</h2>
          <p className="text-muted-foreground leading-relaxed">{tool.description}</p>
        </section>

        {/* Features + Tags */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="card-surface p-6">
            <h3 className="font-medium mb-3">Key features</h3>
            <ul className="space-y-2">
              {tool.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </section>
          <section className="card-surface p-6">
            <h3 className="font-medium mb-3">Best for</h3>
            <ul className="space-y-2">
              {tool.useCases.map((u) => (
                <li key={u} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span>{u}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5 flex flex-wrap gap-1.5">
              {tool.tags.map((t) => (
                <span
                  key={t}
                  className="text-[11px] px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-muted-foreground"
                >
                  {t}
                </span>
              ))}
            </div>
          </section>
        </div>

        {/* Pros / Cons */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="card-surface p-6">
            <h3 className="font-medium mb-3 text-emerald-400">Pros</h3>
            <ul className="space-y-2">
              {tool.pros.map((p) => (
                <li key={p} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </section>
          <section className="card-surface p-6">
            <h3 className="font-medium mb-3 text-rose-400">Cons</h3>
            <ul className="space-y-2">
              {tool.cons.map((c) => (
                <li key={c} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <X className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Alternatives */}
        {alternatives.length > 0 && (
          <section className="mt-12">
            <h2 className="font-display text-2xl mb-5">Alternatives to {tool.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {alternatives.map((t) => (
                <ToolCard key={t.slug} tool={t} />
              ))}
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
