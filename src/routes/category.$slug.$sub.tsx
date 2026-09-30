import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { categoryAccent } from "@/lib/category-accent";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";
import { getCatalogCategory, getCatalogSub, type CatalogCategory, type CatalogSub } from "@/data/catalog";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { CatalogToolCard } from "@/components/CatalogToolCard";
import { Search } from "lucide-react";
import { SeoLongForm } from "@/components/SeoLongForm";
import { RichSeoBlock } from "@/components/RichSeoBlock";
import { buildSubcategoryFallback } from "@/lib/category-seo-content";
import { getSeoContent, type SeoContentRow } from "@/lib/seo.functions";
import { useStickyScroll } from "@/hooks/use-sticky-scroll";

export const Route = createFileRoute("/category/$slug/$sub")({
  loader: async ({ params }): Promise<{ category: CatalogCategory; sub: CatalogSub; seo: SeoContentRow | null }> => {
    const category = getCatalogCategory(params.slug);
    const sub = getCatalogSub(params.slug, params.sub);
    if (!category || !sub) throw notFound();
    const seo = await getSeoContent({
      data: { kind: "subcategory", slugPath: `${params.slug}/${params.sub}` },
    });
    return { category, sub, seo };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { category, sub, seo } = loaderData;
    const fallbackTitle = `Best ${sub.name} (${sub.tools.length}+) — AI Blaze`;
    const fallbackDesc = `${sub.tools.length} curated ${sub.name.toLowerCase()} in ${category.name}. Compare and discover the right AI tool for the job.`;
    const title = seo?.seo_title ?? fallbackTitle;
    const desc = (seo?.seo_description ?? fallbackDesc).slice(0, 158);
    const url = `https://aiblaze.io/category/${category.slug}/${sub.slug}`;
    const ogTitle = seo?.og_title ?? title;
    const ogDesc = (seo?.og_description ?? desc).slice(0, 158);
    const twTitle = seo?.twitter_title ?? ogTitle;
    const twDesc = (seo?.twitter_description ?? ogDesc).slice(0, 158);

    const fallbackLd = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: sub.name,
      numberOfItems: sub.tools.length,
      itemListElement: sub.tools.slice(0, 50).map((t, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: t.name,
        url: t.website,
      })),
    };
    const ldBlocks: unknown[] =
      seo?.structured_data && Array.isArray(seo.structured_data) && seo.structured_data.length > 0
        ? (seo.structured_data as unknown[])
        : [fallbackLd];
    // FAQPage — DB-authored FAQs preferred, else deterministic fallback.
    const dbFaqs = seo?.long_form?.faqs;
    const faqs = dbFaqs?.length ? dbFaqs : buildSubcategoryFallback(category, sub).faqs;
    if (faqs.length > 0) {
      ldBlocks.push({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((f: any) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      });
    }
    // CollectionPage wrapper around the existing ItemList.
    ldBlocks.push({
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: title,
      description: desc,
      url,
      isPartOf: { "@type": "WebSite", name: "AI Blaze", url: "https://aiblaze.io" },
    });
    // Breadcrumbs
    ldBlocks.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Browse", item: "https://aiblaze.io/browse" },
        { "@type": "ListItem", position: 2, name: category.name, item: `https://aiblaze.io/category/${category.slug}` },
        { "@type": "ListItem", position: 3, name: sub.name, item: url },
      ],
    });

    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { name: "robots", content: "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" },
        { property: "og:title", content: ogTitle },
        { property: "og:description", content: ogDesc },
        { property: "og:url", content: url },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: twTitle },
        { name: "twitter:description", content: twDesc },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: ldBlocks.map((block) => ({
        type: "application/ld+json",
        children: JSON.stringify(block),
      })),
    };
  },
  component: SubPage,
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center">
      <p>Sub-category not found. <Link to="/" className="underline">Go home</Link></p>
    </div>
  ),
});

function SubPage() {
  const { category, sub, seo } = Route.useLoaderData() as {
    category: CatalogCategory;
    sub: CatalogSub;
    seo: SeoContentRow | null;
  };
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const n = q.trim().toLowerCase();
    if (!n) return sub.tools;
    return sub.tools.filter((t) => t.name.toLowerCase().includes(n));
  }, [sub.tools, q]);

  const otherSubs = category.subs.filter((s) => s.slug !== sub.slug);
  const headline = seo?.long_form?.h1 ?? sub.name;
  const accent = categoryAccent(category.slug);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className={cn("mx-auto max-w-7xl px-4 sm:px-6 pt-10 pb-16 w-full", accent.className)}>
        <nav className="text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
          <Link to="/browse" className="hover:text-cat transition-colors">Browse</Link>
          <span className="text-border">/</span>
          <Link to="/category/$slug" params={{ slug: category.slug }} className="hover:text-cat transition-colors">{category.short}</Link>
          <span className="text-border">/</span>
          <span className="font-medium text-navy">{sub.name}</span>
        </nav>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-10 lg:gap-12">
          <SubSidebar category={category} activeSubSlug={sub.slug} />



          <section>
            <div className="flex items-center gap-2 text-sm font-semibold text-cat">
              <span className="grid place-items-center w-8 h-8 rounded-lg bg-cat-soft">
                <accent.icon className="w-4 h-4" strokeWidth={1.8} />
              </span>
              {category.short}
            </div>
            <h1 className="mt-4 font-display text-[2.1rem] leading-[1.08] sm:text-4xl md:text-5xl text-navy">{headline}</h1>
            <p className="mt-3 text-muted-foreground max-w-3xl">
              <span className="font-semibold text-navy tabular-nums">{sub.tools.length}</span> curated tools in {category.name}.
            </p>

            <div className="mt-6 flex items-center gap-2 p-1.5 rounded-xl bg-surface border border-navy/15 shadow-[var(--shadow-card)] max-w-xl transition-[border-color,box-shadow] focus-within:border-brand focus-within:shadow-[0_0_0_4px_rgb(56_103_255/0.12)]">
              <Search className="w-4 h-4 text-brand ml-3" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search tools..."
                className="flex-1 bg-transparent outline-none px-2 py-2 text-sm placeholder:text-muted-foreground"
              />
            </div>

            <div className="mt-3 text-xs text-muted-foreground">
              {filtered.length} of {sub.tools.length}
            </div>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {filtered.map((t, i) => (
                <CatalogToolCard key={`${t.name}-${i}`} tool={t} categorySlug={category.slug} subSlug={sub.slug} />
              ))}
            </div>

            <SeoLongForm longForm={seo?.long_form} position="below" />

            {!seo?.long_form && (
              <RichSeoBlock
                content={buildSubcategoryFallback(category, sub)}
                related={otherSubs.slice(0, 12).map((s) => ({
                  label: s.name,
                  to: "/category/$slug/$sub",
                  params: { slug: category.slug, sub: s.slug },
                }))}
              />
            )}
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function SubSidebar({ category, activeSubSlug }: { category: CatalogCategory; activeSubSlug: string }) {
  const ref = useStickyScroll<HTMLElement>(`sub-sidebar-scroll:${category.slug}`);
  return (
    <aside
      ref={ref}
      className="self-start min-w-0 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-3 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:overflow-y-auto lg:overflow-x-hidden lg:py-6 scrollbar-thin"
    >
      <div className="eyebrow mb-3">{category.short}</div>
      <nav className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible scrollbar-thin pb-2 lg:pb-0">
        {category.subs.map((s) => (
          <div key={s.slug} className="shrink-0">
            <SubLink catSlug={category.slug} subSlug={s.slug} active={s.slug === activeSubSlug}>{s.name}</SubLink>
          </div>
        ))}
      </nav>
    </aside>
  );
}

function SubLink({
  catSlug, subSlug, active, children,
}: { catSlug: string; subSlug: string; active?: boolean; children: React.ReactNode }) {
  return (
    <Link
      to="/category/$slug/$sub"
      params={{ slug: catSlug, sub: subSlug }}
      resetScroll={false}
      className={
        "text-sm px-3 py-2 rounded-lg whitespace-nowrap transition-colors " +
        (active
          ? "block bg-surface text-navy font-semibold border border-border shadow-[var(--shadow-card)] border-l-[3px] border-l-[var(--cat)]"
          : "block text-muted-foreground border border-transparent hover:text-navy hover:bg-surface")
      }
    >
      {children}
    </Link>
  );
}
